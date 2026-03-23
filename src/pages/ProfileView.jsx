import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, FileText, Sparkles, Brain, ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { people, refreshPeople, getObservations, getPredictions, removePerson } = useApp();
  const [observations, setObservations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const person = people.find((p) => p.id === id);

  const loadData = useCallback(async () => {
    await refreshPeople();
    setObservations(await getObservations(id));
    setPredictions(await getPredictions(id));
  }, [id, refreshPeople, getObservations, getPredictions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!person) {
    return (
      <div className="page">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <div className="empty-state">
          <div className="empty-state-icon"><Search size={48} strokeWidth={1.5} /></div>
          <h3 className="empty-state-title">Person not found</h3>
          <button className="btn btn-primary mt-lg" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    removePerson(id);
    navigate('/');
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/')} id="profile-back-btn">
        ← People
      </button>

      {/* Header */}
      <div className="mb-lg">
        <h1 className="page-title" style={{ marginBottom: '4px' }}>{person.name}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`badge badge-${person.relationshipType}`}>{person.relationshipType}</span>
          {person.firstImpression && (
            <span className="text-xs text-tertiary">"{person.firstImpression}"</span>
          )}
        </div>
        {predictions.length > 0 && (
          <p className="text-xs text-tertiary mt-md">
            Last prediction: {formatDate(predictions[0]?.createdAt)}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => navigate(`/person/${id}/observe`)}
          id="log-observation-btn"
        >
          <FileText size={18} />
          <span>Log Observation</span>
        </button>
        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={() => navigate(`/person/${id}/predict`)}
          disabled={observations.length === 0}
          id="get-prediction-btn"
        >
          <Sparkles size={18} />
          <span>Get Prediction</span>
        </button>
      </div>

      {predictions.length > 0 && (
        <button
          className="btn btn-ghost btn-full mb-lg"
          onClick={() => navigate(`/person/${id}/intelligence`)}
          id="view-intelligence-btn"
        >
          <Brain size={18} />
          <span>View Intelligence Summary</span>
        </button>
      )}

      {/* Observation Timeline */}
      <div className="section-title">
        Observations ({observations.length})
      </div>

      {observations.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 0' }}>
          <div className="empty-state-icon"><ClipboardList size={48} strokeWidth={1.5} /></div>
          <h3 className="empty-state-title">No observations yet</h3>
          <p className="empty-state-text">
            Log your first observation to start building a behavioral profile.
          </p>
        </div>
      ) : (
        <div className="timeline">
          {observations.map((obs) => (
            <div key={obs.id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-date">{formatDate(obs.loggedAt)}</div>
                <div className="timeline-text">{obs.text}</div>
                {obs.tags && obs.tags.length > 0 && (
                  <div className="timeline-tags">
                    {obs.tags.map((tag) => (
                      <span key={tag} className="timeline-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Danger Zone */}
      <div style={{ marginTop: '48px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
        {!showDeleteConfirm ? (
          <button
            className="btn btn-ghost text-xs"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete this profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="text-sm" style={{ color: 'var(--color-danger)' }}>
              Delete {person.name} and all data?
            </span>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Delete
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
