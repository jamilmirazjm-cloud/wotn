import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AVAILABLE_TAGS = [
  'conflict',
  'positive',
  'vulnerability',
  'withdrawal',
  'generosity',
  'defensiveness',
  'affection',
  'power play',
  'apology',
  'criticism',
];

export default function AddObservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { people, addObservation, refreshPeople } = useApp();
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const person = people.find((p) => p.id === id);

  useEffect(() => {
    refreshPeople();
  }, [refreshPeople]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(`draft_obs_${id}`);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.personId === id) {
          setText(draft.text || '');
          setSelectedTags(draft.tags || []);
        }
      } catch {}
    }
  }, [id]);

  // Auto-save draft
  useEffect(() => {
    if (text.trim()) {
      localStorage.setItem(
        `draft_obs_${id}`,
        JSON.stringify({ personId: id, text, tags: selectedTags })
      );
    } else {
      localStorage.removeItem(`draft_obs_${id}`);
    }
  }, [text, selectedTags, id]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSaving) return;

    let sentiment = 'neutral';
    if (selectedTags.includes('positive') || selectedTags.includes('vulnerability') || selectedTags.includes('generosity')) sentiment = 'positive';
    if (selectedTags.includes('conflict') || selectedTags.includes('defensiveness') || selectedTags.includes('withdrawal')) sentiment = 'negative';

    setIsSaving(true);
    try {
      await addObservation({ personId: id, text: text.trim(), tags: selectedTags, sentiment });
      localStorage.removeItem(`draft_obs_${id}`);
      navigate(`/person/${id}`);
    } catch (error) {
      console.error("Failed to save observation:", error);
      setIsSaving(false);
    }
  };

  if (!person) return null;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(`/person/${id}`)} id="obs-back-btn">
        ← {person.name}
      </button>

      <h1 className="page-title">Log Observation</h1>
      <p className="page-subtitle">What did {person.name} do or say?</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder={`"She stayed quiet during the group dinner but texted me afterwards to check in..."`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ minHeight: '160px' }}
            autoFocus
            id="observation-text"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tags (optional)</label>
          <div className="tag-group">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => navigate(`/person/${id}`)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={!text.trim() || isSaving}
            id="save-observation-btn"
          >
            {isSaving ? 'Saving...' : 'Save Observation'}
          </button>
        </div>
      </form>
    </div>
  );
}
