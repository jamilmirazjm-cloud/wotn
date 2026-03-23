import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function IntelligenceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { people, getObservations, getPredictions, getOutcomes, refreshPeople } = useApp();
  const [observations, setObservations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [outcomes, setOutcomes] = useState([]);

  const person = people.find((p) => p.id === id);

  const loadData = useCallback(async () => {
    await refreshPeople();
    setObservations(await getObservations(id));
    setPredictions(await getPredictions(id));
    setOutcomes(await getOutcomes(id));
  }, [id, refreshPeople, getObservations, getPredictions, getOutcomes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!person) return null;

  const latestPrediction = predictions[0]; // already sorted newest first

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Collect all unique behavioral tendencies across predictions
  const allTendencies = [...new Set(predictions.flatMap((p) => p.behavioralTendencies))];

  // Average accuracy rating
  const ratedOutcomes = outcomes.filter((o) => o.predictionAccuracyRating);
  const avgAccuracy = ratedOutcomes.length > 0
    ? (ratedOutcomes.reduce((sum, o) => sum + o.predictionAccuracyRating, 0) / ratedOutcomes.length).toFixed(1)
    : null;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(`/person/${id}`)} id="intel-back-btn">
        ← {person.name}
      </button>

      <h1 className="page-title">Intelligence</h1>
      <p className="page-subtitle">Complete behavioral profile for {person.name}</p>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-value">{observations.length}</div>
          <div className="stat-label">Observations</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{predictions.length}</div>
          <div className="stat-label">Predictions</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{outcomes.length}</div>
          <div className="stat-label">Outcomes</div>
        </div>
      </div>

      {/* Meta */}
      <div className="card mb-lg" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="text-xs text-tertiary">Profile created</span>
          <span className="text-xs text-secondary">{formatDate(person.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span className="text-xs text-tertiary">Last observation</span>
          <span className="text-xs text-secondary">{observations.length > 0 ? formatDate(observations[0].loggedAt) : '—'}</span>
        </div>
        {avgAccuracy && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-xs text-tertiary">Avg prediction accuracy</span>
            <span className="text-xs text-accent" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{avgAccuracy}/5 <Star size={14} fill="currentColor" /></span>
          </div>
        )}
      </div>

      {/* Core Personality Read */}
      {latestPrediction && (
        <>
          <div className="section-title">Core Personality Read</div>
          <div className="trait-grid mb-lg">
            <div className="trait-item">
              <div className="trait-label">MBTI</div>
              <div className="trait-value">{latestPrediction.personalityRead.mbti}</div>
            </div>
            <div className="trait-item">
              <div className="trait-label">Attachment</div>
              <div className="trait-value">{latestPrediction.personalityRead.attachment_style || latestPrediction.personalityRead.attachmentStyle}</div>
            </div>
            <div className="trait-item">
              <div className="trait-label">Love Language</div>
              <div className="trait-value">{(latestPrediction.personalityRead.love_language || latestPrediction.personalityRead.loveLanguage || '').replace(/_/g, ' ')}</div>
            </div>
            <div className="trait-item">
              <div className="trait-label">Communication</div>
              <div className="trait-value">{latestPrediction.personalityRead.communication_style || latestPrediction.personalityRead.communicationStyle}</div>
            </div>
          </div>
        </>
      )}

      {/* Behavioral Patterns */}
      {allTendencies.length > 0 && (
        <>
          <div className="section-title">Behavioral Patterns</div>
          <div className="mb-lg">
            {allTendencies.map((tendency, idx) => (
              <div key={idx} className="tendency-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="tendency-icon" />
                <div className="tendency-text">{tendency}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Prediction History */}
      {predictions.length > 0 && (
        <>
          <div className="section-title">Prediction History</div>
          <div className="mb-lg">
            {predictions.map((pred) => (
              <div key={pred.id} className="card" style={{ marginBottom: '12px', padding: '16px' }}>
                <div className="flex-between mb-md">
                  <span className="text-sm" style={{ fontWeight: 600 }}>{pred.goal}</span>
                  <span className={`badge badge-${pred.dataQuality}`}>{pred.dataQuality}</span>
                </div>
                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                  {pred.behavioralTendencies.map((t, i) => (
                    <li key={i} className="text-xs text-secondary" style={{ marginBottom: '4px', lineHeight: 1.5 }}>{t}</li>
                  ))}
                </ul>
                <div className="text-xs text-tertiary mt-md">{formatDate(pred.createdAt)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Interaction Timeline */}
      <div className="section-title">Full Observation Timeline</div>
      {observations.length > 0 ? (
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
      ) : (
        <p className="text-sm text-tertiary">No observations logged yet.</p>
      )}

      {/* Outcomes */}
      {outcomes.length > 0 && (
        <>
          <div className="section-title mt-lg">Logged Outcomes</div>
          {outcomes.map((outcome) => (
            <div key={outcome.id} className="card" style={{ marginBottom: '12px', padding: '16px' }}>
              <div className="text-xs text-tertiary mb-md">
                {formatDate(outcome.createdAt)} — Goal: {outcome.goal}
                {outcome.predictionAccuracyRating && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}> — Accuracy: {outcome.predictionAccuracyRating}/5 <Star size={14} fill="currentColor" style={{ color: 'var(--color-warning)' }} /></span>
                )}
              </div>
              <div className="text-sm text-secondary">{outcome.whatHappened}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
