import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Zap, Target, Heart, Eye, Shield, Brain, Sparkles, AlertTriangle, Wand2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const GOALS = [
  { value: 'resolve conflict', label: 'Resolve conflict', Icon: Zap },
  { value: 'make an ask', label: 'Make an ask', Icon: Target },
  { value: 'strengthen bond', label: 'Strengthen bond', Icon: Heart },
  { value: 'understand a reaction', label: 'Understand a reaction', Icon: Eye },
  { value: 'navigate power dynamics', label: 'Navigate power dynamics', Icon: Shield },
  { value: 'general understanding', label: 'General understanding', Icon: Brain },
];

export default function PredictScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { people, loading, error, clearError, requestPrediction, refreshPeople, getObservations } = useApp();
  const [goal, setGoal] = useState('');
  const [scenario, setScenario] = useState('');
  const [step, setStep] = useState('goal'); // 'goal' | 'scenario' | 'results'
  const [prediction, setPrediction] = useState(null);
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);

  const person = people.find((p) => p.id === id);

  useEffect(() => {
    refreshPeople();
  }, [refreshPeople]);

  const obsCount = person?.observationCount || 0;

  const handlePredict = useCallback(async () => {
    if (!goal) return;
    clearError();
    try {
      const result = await requestPrediction(id, goal, scenario || undefined);
      setPrediction(result);
      setStep('results');
    } catch {
      // Error is handled by context
    }
  }, [id, goal, scenario, clearError, requestPrediction]);

  if (!person) return null;

  const dataQualityLabel = {
    thin: { label: 'Low Confidence', desc: '1-3 observations — predictions will improve with more data' },
    moderate: { label: 'Medium Confidence', desc: '4-10 observations — solid foundation for analysis' },
    rich: { label: 'High Confidence', desc: '11+ observations — well-grounded behavioral profile' },
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(`/person/${id}`)} id="predict-back-btn">
        ← {person.name}
      </button>

      {step === 'goal' && (
        /* ---- Step 1: Goal Selection ---- */
        <>
          <h1 className="page-title">Predict Behavior</h1>
          <p className="page-subtitle">
            What do you want to accomplish with {person.name}?
            <br />
            <span className="text-xs">Based on {obsCount} observation{obsCount !== 1 ? 's' : ''}</span>
          </p>

          <div className="form-group">
            <label className="form-label">Select your goal</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  className={`card card-clickable ${goal === g.value ? '' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    border: goal === g.value ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: goal === g.value ? 'var(--accent-glow)' : 'var(--bg-card)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onClick={() => setGoal(g.value)}
                  id={`goal-${g.value.replace(/\s+/g, '-')}`}
                >
                  <g.Icon size={20} strokeWidth={1.5} />
                  <span style={{ fontWeight: 400 }}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-banner-text">{error}</span>
              <button className="error-banner-close" onClick={clearError}>×</button>
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-lg mt-lg"
            onClick={() => setStep('scenario')}
            disabled={!goal}
            id="continue-to-scenario-btn"
          >
            <span>Continue</span>
          </button>
        </>
      )}

      {step === 'scenario' && (
        /* ---- Step 2: Scenario Context ---- */
        <>
          <h1 className="page-title">What's happening right now?</h1>
          <p className="page-subtitle">
            With {person.name} — {goal}
          </p>

          <div className="scenario-guidance">
            <p className="text-sm text-secondary" style={{ marginBottom: '8px', fontWeight: 500 }}>
              The more specific you are, the more accurate the prediction.
            </p>
            <ul className="scenario-hints">
              <li>What specifically happened?</li>
              <li>What did they say or do?</li>
              <li>How did you react?</li>
              <li>What are you hoping will happen?</li>
            </ul>
          </div>

          <textarea
            className="scenario-textarea"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder={`E.g., "${person.name} got upset when I said their idea wouldn't work. Won't explain why. I felt dismissed."`}
            maxLength={1000}
          />
          <div className="scenario-footer">
            <span className={`scenario-char-count ${scenario.length > 0 && scenario.length < 30 ? 'insufficient' : ''}`}>
              {scenario.length}/1000
              {scenario.length > 0 && scenario.length < 30 && ' (min 30 for best results)'}
            </span>
          </div>

          <button
            className="collapsible-header mt-md"
            onClick={() => setExamplesOpen(!examplesOpen)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <span className="text-sm text-secondary">Example scenarios</span>
            <span className={`collapsible-arrow ${examplesOpen ? 'open' : ''}`}>▼</span>
          </button>
          {examplesOpen && (
            <div className="scenario-examples">
              {[
                `I asked ${person.name} to cover a shift and they said no sharply. Normally they'd apologize, but this time they just walked away.`,
                `We haven't talked in a week. Now ${person.name} is being short with me but won't say what's wrong.`,
                `I brought up an idea in the team meeting and ${person.name} immediately shot it down. Later they seemed annoyed with me.`,
              ].map((ex, i) => (
                <button
                  key={i}
                  className="scenario-example-card"
                  onClick={() => setScenario(ex)}
                >
                  <span className="text-xs text-secondary">"{ex}"</span>
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="error-banner mt-md">
              <span className="error-banner-text">{error}</span>
              <button className="error-banner-close" onClick={clearError}>×</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setStep('goal')}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handlePredict}
              disabled={loading || (scenario.length > 0 && scenario.length < 30)}
              id="generate-prediction-btn"
            >
              <Sparkles size={18} />
              <span>{loading ? 'Analyzing...' : scenario.length >= 30 ? 'Generate Prediction' : 'Skip Scenario & Generate'}</span>
            </button>
          </div>

          {loading && (
            <div className="loading-container" style={{ padding: '24px' }}>
              <div className="loading-spinner" />
              <div className="loading-text">
                Analyzing {person.name}'s behavioral patterns...
              </div>
            </div>
          )}
        </>
      )}

      {step === 'results' && prediction && (
        /* ---- Step 3: Results ---- */
        <>
          <h1 className="page-title">{person.name}</h1>
          <p className="page-subtitle">Behavioral Analysis — {goal}</p>

          {/* Data Quality */}
          <div style={{ marginBottom: '24px' }}>
            <span className={`badge badge-${prediction.dataQuality}`}>
              {dataQualityLabel[prediction.dataQuality]?.label || prediction.dataQuality}
            </span>
            <p className="text-xs text-tertiary" style={{ marginTop: '4px' }}>
              {dataQualityLabel[prediction.dataQuality]?.desc}
            </p>
          </div>

          {/* Prediction Note */}
          {prediction.predictionNote && (
            <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(196,168,130,0.4)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
              <p className="text-sm" style={{ color: 'var(--color-warning)' }}>
                {prediction.predictionNote}
              </p>
            </div>
          )}

          {/* Behavioral Tendencies */}
          <div className="section-title">Behavioral Tendencies</div>
          <div style={{ marginBottom: '32px' }}>
            {prediction.behavioralTendencies.map((tendency, idx) => (
              <div key={idx} className="tendency-item">
                <div className="tendency-icon" />
                <div className="tendency-text">{tendency}</div>
              </div>
            ))}
          </div>

          {/* Personality Read (Collapsible) */}
          <div
            className="collapsible-header"
            onClick={() => setPersonalityOpen(!personalityOpen)}
            id="personality-toggle"
          >
            <span className="section-title" style={{ margin: 0 }}>Personality Read</span>
            <span className={`collapsible-arrow ${personalityOpen ? 'open' : ''}`}>▼</span>
          </div>

          {personalityOpen && (
            <div style={{ marginBottom: '32px' }}>
              <div className="trait-grid">
                <div className="trait-item">
                  <div className="trait-label">MBTI</div>
                  <div className="trait-value">{prediction.personalityRead.mbti}</div>
                </div>
                <div className="trait-item">
                  <div className="trait-label">Attachment</div>
                  <div className="trait-value">{prediction.personalityRead.attachment_style || prediction.personalityRead.attachmentStyle}</div>
                </div>
                <div className="trait-item">
                  <div className="trait-label">Love Language</div>
                  <div className="trait-value">{(prediction.personalityRead.love_language || prediction.personalityRead.loveLanguage || '').replace(/_/g, ' ')}</div>
                </div>
                <div className="trait-item">
                  <div className="trait-label">Communication</div>
                  <div className="trait-value">{prediction.personalityRead.communication_style || prediction.personalityRead.communicationStyle}</div>
                </div>
              </div>
              <p className="text-xs text-tertiary mt-md">All markers inferred from observations</p>
            </div>
          )}

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() =>
                navigate(`/person/${id}/playbook/${prediction.id}`)
              }
              id="see-tactical-advice-btn"
            >
              <Wand2 size={18} />
              <span>See Tactical Advice</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/person/${id}`)}
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
