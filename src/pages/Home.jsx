import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { claimLegacyData } from '../lib/api';

export default function Home({ onOpenAddPerson }) {
  const { people, refreshPeople } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [migrating, setMigrating] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);

  const handleClaimLegacyData = async () => {
    setMigrating(true);
    try {
      const result = await claimLegacyData();
      setMigrationDone(true);
      if (result.migrated > 0) refreshPeople();
    } catch (e) {
      console.error(e);
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    refreshPeople();
  }, [refreshPeople]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="page">
      <div className="home-header">
        <h1 className="page-title" style={{ margin: 0 }}>People</h1>
        <div className="home-user">
          <span className="home-username">{user?.username}</span>
          <button
            className="logout-btn"
            onClick={logout}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Legacy data migration banner */}
      {!migrationDone && (
        <div className="migration-banner">
          <div className="migration-banner-text">
            <strong>Have existing data?</strong>
            <span>Claim your pre-auth observations and people in one click.</span>
          </div>
          <button
            className="migration-btn"
            onClick={handleClaimLegacyData}
            disabled={migrating}
          >
            {migrating ? (
              <span className="login-spinner" style={{ borderColor: 'rgba(45,45,94,0.2)', borderTopColor: 'var(--accent-primary)' }} />
            ) : (
              <Download size={14} />
            )}
            {migrating ? 'Claiming…' : 'Claim data'}
          </button>
        </div>
      )}

      {migrationDone && (
        <div className="migration-success">
          Your previous data has been claimed successfully.
        </div>
      )}

      <p className="page-subtitle">
        {people.length === 0
          ? 'Start by adding someone you want to understand better'
          : `${people.length} ${people.length === 1 ? 'person' : 'people'} tracked`}
      </p>

      {people.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No people yet</h3>
          <p className="empty-state-text">
            Add someone to start logging observations and generating behavioral insights.
          </p>
          <button className="btn btn-primary" onClick={onOpenAddPerson} id="add-first-person-btn">
            + Add your first person
          </button>
        </div>
      ) : (
        <div>
          {people.map((person) => (
            <div
              key={person.id}
              className="card card-clickable person-card"
              onClick={() => navigate(`/person/${person.id}`)}
              id={`person-card-${person.id}`}
            >
              <div className="person-avatar">{getInitials(person.name)}</div>
              <div className="person-info">
                <div className="person-name">{person.name}</div>
                <div className="person-meta">
                  <span className={`badge badge-${person.relationshipType}`}>
                    {person.relationshipType}
                  </span>
                  <span>·</span>
                  <span>{person.observationCount} obs</span>
                  {person.lastPredictionDate && (
                    <>
                      <span>·</span>
                      <span>Predicted {formatDate(person.lastPredictionDate)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="person-arrow">›</div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={onOpenAddPerson} id="add-person-fab" aria-label="Add person">
        +
      </button>
    </div>
  );
}
