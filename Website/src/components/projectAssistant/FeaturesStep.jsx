import React, { useState } from 'react';
import AssistantStep from './AssistantStep';
import './ProjectAssistantSteps.css';

const SUGGESTIONS_BY_TYPE = {
  'Web Application': ['Login', 'Dashboard', 'Search', 'Notifications'],
  'Backend / API': ['Authentication', 'REST API', 'Validation', 'Database'],
  'Database / SQL': ['Tables', 'Relationships', 'Reports', 'Queries'],
  'College / Academic Project': ['Admin Panel', 'Reports', 'Testing', 'Documentation'],
  'Custom Software': ['User Roles', 'Data Export', 'Audit Logs', 'Integrations'],
  'Other': ['User Access', 'Data Processing', 'Reports', 'API Integration'],
};

/**
 * FeaturesStep Component (Step 3)
 * Allows visitors to add, edit, and remove features with project-type-specific suggestion chips.
 */
export default function FeaturesStep({
  projectType,
  features,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature,
  onBack,
  onNext,
  onReset,
  error,
}) {
  const [newFeatureText, setNewFeatureText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [inputError, setInputError] = useState('');

  const suggestions = SUGGESTIONS_BY_TYPE[projectType] || SUGGESTIONS_BY_TYPE['Web Application'];

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    const trimmed = newFeatureText.trim();
    if (!trimmed) {
      setInputError('Please enter a feature name before adding.');
      return;
    }
    if (features.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('This feature has already been added.');
      return;
    }

    onAddFeature(trimmed);
    setNewFeatureText('');
    setInputError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (features.includes(suggestion)) {
      return;
    }
    onAddFeature(suggestion);
    setInputError('');
  };

  const startEdit = (idx) => {
    setEditingIndex(idx);
    setEditingText(features[idx]);
  };

  const saveEdit = (idx) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    onUpdateFeature(idx, trimmed);
    setEditingIndex(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  return (
    <AssistantStep
      stepNumber="03"
      heading="What should the system do?"
      subheading="Specify the core features and capabilities your project requires. At least one feature is required."
      error={error}
      onBack={onBack}
      onNext={onNext}
      onReset={onReset}
      nextLabel="Next: Project Scope →"
    >
      <div className="assistant-features-step">
        {/* Suggestion Chips */}
        <div className="assistant-suggestions-block">
          <span className="assistant-suggestions-label font-mono">
            SUGGESTED FOR {projectType ? projectType.toUpperCase() : 'YOUR PROJECT'} (OPTIONAL):
          </span>
          <div className="assistant-chips-row" role="group" aria-label="Suggested features">
            {suggestions.map((item) => {
              const isAdded = features.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={`assistant-chip ${isAdded ? 'assistant-chip--added' : ''}`}
                  onClick={() => handleSuggestionClick(item)}
                  title={isAdded ? 'Already added to features' : `Add ${item}`}
                >
                  <span className="assistant-chip__plus">{isAdded ? '✓' : '+'}</span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
          <span className="assistant-help-text">
            Click any suggestion to add it, or type your custom requirement below.
          </span>
        </div>

        {/* Feature Input Row */}
        <div className="assistant-feature-input-row">
          <div className="assistant-field-group" style={{ flex: 1 }}>
            <label htmlFor="assistant-feature-input" className="assistant-label">
              Feature Name
            </label>
            <input
              id="assistant-feature-input"
              type="text"
              className="assistant-input"
              placeholder="e.g., User authentication with role permissions"
              value={newFeatureText}
              onChange={(e) => {
                setNewFeatureText(e.target.value);
                if (inputError) setInputError('');
              }}
              onKeyDown={handleKeyDown}
            />
            {inputError && (
              <span className="assistant-field-error">{inputError}</span>
            )}
          </div>
          <button
            type="button"
            className="assistant-btn assistant-btn--primary assistant-add-btn"
            onClick={handleAdd}
          >
            Add Feature
          </button>
        </div>

        {/* Features List */}
        <div className="assistant-features-list-wrapper">
          <div className="assistant-features-list-header">
            <span className="assistant-features-count font-mono">
              SPECIFIED FEATURES ({features.length})
            </span>
          </div>

          {features.length === 0 ? (
            <div className="assistant-empty-features">
              <span className="assistant-empty-features__text">
                No features added yet. Add at least one feature using the field above or the suggestions.
              </span>
            </div>
          ) : (
            <ul className="assistant-features-list">
              {features.map((feature, idx) => {
                const isEditing = editingIndex === idx;

                return (
                  <li key={idx} className="assistant-feature-item">
                    {isEditing ? (
                      <div className="assistant-feature-edit-box">
                        <input
                          type="text"
                          className="assistant-input assistant-input--inline"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(idx);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                        <div className="assistant-feature-edit-actions">
                          <button
                            type="button"
                            className="assistant-btn assistant-btn--primary assistant-btn--small"
                            onClick={() => saveEdit(idx)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="assistant-btn assistant-btn--secondary assistant-btn--small"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="assistant-feature-item__content">
                          <span className="assistant-feature-item__num font-mono">{idx + 1}.</span>
                          <span className="assistant-feature-item__text">{feature}</span>
                        </div>
                        <div className="assistant-feature-item__actions">
                          <button
                            type="button"
                            className="assistant-action-btn"
                            onClick={() => startEdit(idx)}
                            aria-label={`Edit feature ${feature}`}
                            title="Edit feature"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="assistant-action-btn assistant-action-btn--delete"
                            onClick={() => onRemoveFeature(idx)}
                            aria-label={`Remove feature ${feature}`}
                            title="Remove feature"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AssistantStep>
  );
}
