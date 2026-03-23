import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, AlertCircle, Check, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PlaybookScreen() {
  const { id, predictionId } = useParams();
  const navigate = useNavigate();
  const { people, getPredictions, addOutcome, refreshPeople } = useApp();
  const [prediction, setPrediction] = useState(null);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [whatHappened, setWhatHappened] = useState('');
  const [accuracyRating, setAccuracyRating] = useState(0);

  const person = people.find((p) => p.id === id);

  useEffect(() => {
    async function load() {
      await refreshPeople();
      const preds = await getPredictions(id);
      const pred = preds.find((p) => p.id === predictionId);
      setPrediction(pred);
    }
    load();
  }, [id, predictionId, getPredictions, refreshPeople]);

  if (!person || !prediction) {
    return (
      <div className="page">
        <button className="back-btn" onClick={() => navigate(`/person/${id}`)}>← Back</button>
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  const cardStyles = {
    Approach: 'action-card-approach',
    Framing: 'action-card-framing',
    Avoid: 'action-card-avoid',
  };

  const cardIcons = {
    Approach: CheckCircle,
    Framing: Circle,
    Avoid: AlertCircle,
  };

  const handleLogOutcome = async () => {
    if (!whatHappened.trim()) return;

    try {
      await addOutcome({
        personId: id,
        predictionId: predictionId,
        goal: prediction.goal,
        whatHappened: whatHappened.trim(),
        predictionAccuracyRating: accuracyRating || null,
      });

      setShowOutcomeModal(false);
      setWhatHappened('');
      setAccuracyRating(0);
      navigate(`/person/${id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(`/person/${id}/predict`)} id="playbook-back-btn">
        ← Prediction
      </button>

      <h1 className="page-title">Tactical Playbook</h1>
      <p className="page-subtitle">
        How to approach: <strong>{prediction.goal}</strong> with {person.name}
      </p>

      {/* Action Cards */}
      {prediction.actionCards.map((card, idx) => {
        const IconComponent = cardIcons[card.title];
        return (
          <div
            key={idx}
            className={`action-card ${cardStyles[card.title] || ''}`}
          >
            <div className="action-card-title">
              {IconComponent ? <IconComponent size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> : '•'} {card.title}
            </div>
            <div className="action-card-content">{card.content}</div>
          </div>
        );
      })}

      {/* CTA */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => setShowOutcomeModal(true)}
          id="try-this-btn"
        >
          <Check size={18} />
          <span>I'll try this</span>
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/person/${id}`)}
        >
          Back to Profile
        </button>
      </div>

      {/* Outcome Logger Modal */}
      {showOutcomeModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowOutcomeModal(false)}>
          <div className="modal" id="outcome-modal">
            <h2 className="modal-title">Log Outcome</h2>
            <p className="text-sm text-secondary mb-lg">
              Come back after your interaction and describe what happened.
            </p>

            <div className="form-group">
              <label className="form-label">What happened?</label>
              <textarea
                className="form-textarea"
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="Describe the interaction and outcome..."
                id="outcome-text"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">How accurate was the prediction? (optional)</label>
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rating-star ${star <= accuracyRating ? 'active' : ''}`}
                    onClick={() => setAccuracyRating(star)}
                    id={`rating-star-${star}`}
                  >
                    <Star size={20} fill={star <= accuracyRating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              {accuracyRating > 0 && (
                <p className="text-xs text-tertiary mt-md">
                  {accuracyRating <= 2 ? 'Not very accurate' : accuracyRating <= 3 ? 'Somewhat accurate' : 'Very accurate'}
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowOutcomeModal(false)}>
                Later
              </button>
              <button
                className="btn btn-primary"
                disabled={!whatHappened.trim()}
                onClick={handleLogOutcome}
                id="save-outcome-btn"
              >
                Save Outcome
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
