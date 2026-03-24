import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, MessageCircle, X, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, QUESTIONS, getQualityLabel } from '../lib/btpQuestions';

export default function BuildThePicture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { people, getBtpProgress, saveBtpAnswer, refreshPeople } = useApp();
  const [answers, setAnswers] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [answerSheet, setAnswerSheet] = useState(null); // { categoryId, questionId, text }
  const [saving, setSaving] = useState(false);

  const person = people.find((p) => p.id === id);
  const relType = person?.relationshipType?.toLowerCase() || 'friend';

  const loadProgress = useCallback(async () => {
    try {
      const progress = await getBtpProgress(id);
      setAnswers(progress.answers || {});
    } catch (e) {
      console.error(e);
    }
  }, [id, getBtpProgress]);

  useEffect(() => {
    refreshPeople();
    loadProgress();
  }, [refreshPeople, loadProgress]);

  if (!person) return null;

  const completedCategories = Object.keys(answers).length;
  const qualityLabel = getQualityLabel(completedCategories);

  const getQuestionsForCategory = (categoryId) => {
    return QUESTIONS[categoryId]?.[relType] || QUESTIONS[categoryId]?.friend || [];
  };

  const personalize = (text) => text.replace(/\[Name\]/g, person.name);

  const handleSaveAnswer = async () => {
    if (!answerSheet || answerSheet.text.length < 20) return;
    setSaving(true);
    try {
      await saveBtpAnswer({
        personId: id,
        text: answerSheet.text,
        signalCategory: answerSheet.categoryId,
        questionId: answerSheet.questionId,
        relationshipContext: relType,
      });
      await loadProgress();
      setAnswerSheet(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryAnswerCount = (categoryId) => {
    return answers[categoryId] ? Object.keys(answers[categoryId]).length : 0;
  };

  // Category Overview
  if (!activeCategory) {
    return (
      <div className="page">
        <button className="back-btn" onClick={() => navigate(`/person/${id}`)}>
          ← {person.name}
        </button>

        <div className="btp-header">
          <div className="btp-progress-ring-container">
            <svg className="btp-progress-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
              <circle
                cx="40" cy="40" r="35"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(completedCategories / 7) * 220} 220`}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="btp-progress-ring-text">
              {completedCategories}/{7}
            </div>
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>Build the Picture</h1>
            <p className="page-subtitle" style={{ marginBottom: '4px' }}>
              {person.name} — {qualityLabel.label}
            </p>
            <p className="text-xs text-tertiary">{qualityLabel.description}</p>
          </div>
        </div>

        <p className="text-sm text-secondary mb-lg">
          Answer questions by category to help the system understand {person.name} better.
          The more you share, the more accurate predictions become.
        </p>

        <div className="btp-category-list">
          {CATEGORIES.map((cat) => {
            const count = getCategoryAnswerCount(cat.id);
            const total = getQuestionsForCategory(cat.id).length;
            const isComplete = count > 0;
            return (
              <button
                key={cat.id}
                className="btp-category-card"
                onClick={() => setActiveCategory(cat.id)}
              >
                <div className="btp-category-card-left">
                  <div className={`btp-category-indicator ${isComplete ? 'complete' : ''}`}>
                    {isComplete ? <Check size={14} /> : <MessageCircle size={14} />}
                  </div>
                  <div>
                    <div className="btp-category-name">{cat.name}</div>
                    <div className="btp-category-desc">{cat.description}</div>
                    {count > 0 && (
                      <div className="btp-category-count">{count}/{total} answered</div>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-tertiary" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Category Questions View
  const category = CATEGORIES.find((c) => c.id === activeCategory);
  const questions = getQuestionsForCategory(activeCategory);
  const categoryAnswers = answers[activeCategory] || {};

  return (
    <div className="page">
      <button className="back-btn" onClick={() => setActiveCategory(null)}>
        ← Categories
      </button>

      <h1 className="page-title">{category.name}</h1>
      <p className="page-subtitle">{category.description}</p>

      <div className="btp-questions-list">
        {questions.map((q) => {
          const existingAnswer = categoryAnswers[q.id];
          return (
            <div key={q.id} className="btp-question-card">
              <div className="btp-question-text">{personalize(q.text)}</div>
              {existingAnswer ? (
                <div className="btp-answer-display">
                  <div className="btp-answer-text">{existingAnswer.text}</div>
                  <button
                    className="btp-answer-edit"
                    onClick={() => setAnswerSheet({ categoryId: activeCategory, questionId: q.id, text: existingAnswer.text })}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  className="btp-answer-btn"
                  onClick={() => setAnswerSheet({ categoryId: activeCategory, questionId: q.id, text: '' })}
                >
                  Tap to answer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Answer Sheet Overlay */}
      {answerSheet && (
        <div className="btp-sheet-overlay" onClick={() => setAnswerSheet(null)}>
          <div className="btp-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="btp-sheet-header">
              <button className="btp-sheet-close" onClick={() => setAnswerSheet(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="btp-sheet-question">
              {personalize(questions.find((q) => q.id === answerSheet.questionId)?.text || '')}
            </div>
            <div className="btp-sheet-hint">Be specific — recall a particular moment or example.</div>
            <textarea
              className="btp-sheet-textarea"
              value={answerSheet.text}
              onChange={(e) => setAnswerSheet({ ...answerSheet, text: e.target.value })}
              placeholder={`E.g., "Last month when we were at dinner, ${person.name} got really quiet after I mentioned..."`}
              maxLength={1000}
              autoFocus
            />
            <div className="btp-sheet-footer">
              <span className={`btp-char-count ${answerSheet.text.length < 20 ? 'insufficient' : ''}`}>
                {answerSheet.text.length}/1000
                {answerSheet.text.length < 20 && answerSheet.text.length > 0 && ' (min 20)'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setAnswerSheet(null)}
                >
                  Skip
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAnswer}
                  disabled={answerSheet.text.length < 20 || saving}
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
