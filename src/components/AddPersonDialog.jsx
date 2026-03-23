import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const RELATIONSHIP_TYPES = ['friend', 'family', 'partner', 'colleague'];

export default function AddPersonDialog({ isOpen, onClose, onCreated }) {
  const { addPerson } = useApp();
  const navigate = useNavigate(); // Initialize useNavigate
  const [name, setName] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [firstImpression, setFirstImpression] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => { // Made handleSubmit async
    e.preventDefault();
    if (!name.trim() || !relationshipType) return;

    const person = await addPerson({ // Await addPerson
      name: name.trim(),
      relationshipType,
      firstImpression: firstImpression.trim() || null,
    });

    setName('');
    setRelationshipType('');
    setFirstImpression('');
    onClose();
    if (onCreated) onCreated(person);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" id="add-person-modal">
        <h2 className="modal-title">New Person</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="person-name">
              Full Name *
            </label>
            <input
              id="person-name"
              className="form-input"
              type="text"
              placeholder="e.g., Sarah Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="relationship-type">
              Relationship *
            </label>
            <select
              id="relationship-type"
              className="form-select"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select relationship type
              </option>
              {RELATIONSHIP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="first-impression">
              First Impression (optional)
            </label>
            <input
              id="first-impression"
              className="form-input"
              type="text"
              placeholder="3-word description, e.g., warm but guarded"
              value={firstImpression}
              onChange={(e) => setFirstImpression(e.target.value)}
              maxLength={60}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} id="cancel-add-person">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!name.trim() || !relationshipType}
              id="create-person-btn"
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
