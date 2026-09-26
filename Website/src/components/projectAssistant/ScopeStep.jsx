import React from 'react';
import AssistantStep from './AssistantStep';
import './ProjectAssistantSteps.css';

const TIMELINE_OPTIONS = [
  'Not decided',
  '1–2 weeks',
  '2–4 weeks',
  '1–2 months',
  'More than 2 months',
];

const BUDGET_OPTIONS = [
  'Not decided',
  'Under ₹10,000',
  '₹10,000–₹25,000',
  '₹25,000–₹50,000',
  'Above ₹50,000',
];

/**
 * ScopeStep Component (Step 4)
 * Captures timeline, budget range, technology preference, and additional notes.
 * Explicitly avoids automatic pricing calculation or delivery date promises.
 */
export default function ScopeStep({
  timeline,
  budget,
  techPreference,
  additionalRequirements,
  onChangeField,
  onBack,
  onNext,
  onReset,
  error,
}) {
  return (
    <AssistantStep
      stepNumber="04"
      heading="What does the project look like?"
      subheading="Outline your target timeline, approximate budget expectation, and any technology preferences."
      error={error}
      onBack={onBack}
      onNext={onNext}
      onReset={onReset}
      nextLabel="Next: Review Brief →"
    >
      <div className="assistant-scope-fields">
        {/* Timeline Selection */}
        <div className="assistant-field-group">
          <label className="assistant-label" id="timeline-group-label">
            Target Timeline
          </label>
          <div
            className="assistant-pills-grid"
            role="radiogroup"
            aria-labelledby="timeline-group-label"
          >
            {TIMELINE_OPTIONS.map((opt) => {
              const isSelected = timeline === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`assistant-pill-btn ${isSelected ? 'assistant-pill-btn--active' : ''}`}
                  onClick={() => onChangeField('timeline', opt)}
                >
                  <span className="assistant-pill-dot" aria-hidden="true" />
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          <span className="assistant-help-text">
            Estimates help plan implementation phases. Final schedule is finalized upon agreement.
          </span>
        </div>

        {/* Budget Selection */}
        <div className="assistant-field-group">
          <label className="assistant-label" id="budget-group-label">
            Approximate Budget Expectation
          </label>
          <div
            className="assistant-pills-grid"
            role="radiogroup"
            aria-labelledby="budget-group-label"
          >
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = budget === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`assistant-pill-btn ${isSelected ? 'assistant-pill-btn--active' : ''}`}
                  onClick={() => onChangeField('budget', opt)}
                >
                  <span className="assistant-pill-dot" aria-hidden="true" />
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          <span className="assistant-help-text">
            Helps scope the feature set realistically. No automated pricing is generated.
          </span>
        </div>

        {/* Technology Preference Field */}
        <div className="assistant-field-group">
          <label htmlFor="assistant-tech-pref" className="assistant-label">
            Technology Preference <span className="assistant-optional">(Optional)</span>
          </label>
          <input
            id="assistant-tech-pref"
            type="text"
            className="assistant-input"
            placeholder="Python, Flask, MySQL..."
            value={techPreference}
            onChange={(e) => onChangeField('techPreference', e.target.value)}
          />
          <span className="assistant-help-text">
            Languages, frameworks, or database engines you prefer or currently have in place.
          </span>
        </div>

        {/* Additional Requirements Field */}
        <div className="assistant-field-group">
          <label htmlFor="assistant-additional-reqs" className="assistant-label">
            Additional Requirements <span className="assistant-optional">(Optional)</span>
          </label>
          <textarea
            id="assistant-additional-reqs"
            rows={4}
            className="assistant-textarea"
            placeholder="Any specific deployment requirements, integrations, or constraints..."
            value={additionalRequirements}
            onChange={(e) => onChangeField('additionalRequirements', e.target.value)}
          />
          <span className="assistant-help-text">
            Mention hosting preferences, existing repositories, or specific constraints.
          </span>
        </div>
      </div>
    </AssistantStep>
  );
}
