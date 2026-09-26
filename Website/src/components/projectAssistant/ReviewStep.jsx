import React from 'react';
import AssistantStep from './AssistantStep';
import './ProjectAssistantSteps.css';

/**
 * ReviewStep Component (Step 5)
 * Structured review of the completed project brief.
 * Allows inline editing jumps, resetting, and proceeding to the Project Builder.
 */
export default function ReviewStep({
  formData,
  onEditStep,
  onReset,
  onContinueToBuilder,
}) {
  const customActions = (
    <div className="assistant-step-nav assistant-step-nav--review">
      <div className="assistant-step-nav__left">
        <button
          type="button"
          className="assistant-btn assistant-btn--secondary"
          onClick={() => onEditStep(4)}
        >
          ← Edit Previous Step
        </button>
        <button
          type="button"
          className="assistant-btn assistant-btn--ghost"
          onClick={onReset}
          title="Clear all fields and start over"
        >
          Start Over
        </button>
      </div>

      <div className="assistant-step-nav__right">
        <button
          type="button"
          className="assistant-btn assistant-btn--primary assistant-btn--continue"
          onClick={onContinueToBuilder}
        >
          Continue to Project Builder →
        </button>
      </div>
    </div>
  );

  return (
    <AssistantStep
      stepNumber="05"
      heading="Your Project Brief"
      subheading="Review your structured project summary. You can adjust any section or continue directly to the Project Builder."
      customActions={customActions}
    >
      <div className="assistant-review-container">
        {/* Brief Overview Card */}
        <div className="assistant-brief-summary" role="region" aria-label="Structured Project Brief">
          {/* Section 1: Overview */}
          <div className="assistant-brief-section">
            <div className="assistant-brief-section__header">
              <span className="assistant-brief-section__num font-mono">01</span>
              <h3 className="assistant-brief-section__title">Project Classification</h3>
              <button
                type="button"
                className="assistant-brief-edit-link font-mono"
                onClick={() => onEditStep(1)}
                aria-label="Edit Project Type"
              >
                Edit
              </button>
            </div>
            <div className="assistant-brief-row">
              <span className="assistant-brief-label font-mono">Project Type</span>
              <span className="assistant-brief-value assistant-brief-value--highlight">
                {formData.projectType || 'Not specified'}
              </span>
            </div>
          </div>

          {/* Section 2: Core Details */}
          <div className="assistant-brief-section">
            <div className="assistant-brief-section__header">
              <span className="assistant-brief-section__num font-mono">02</span>
              <h3 className="assistant-brief-section__title">Problem & Title</h3>
              <button
                type="button"
                className="assistant-brief-edit-link font-mono"
                onClick={() => onEditStep(2)}
                aria-label="Edit Problem and Title"
              >
                Edit
              </button>
            </div>
            <div className="assistant-brief-row">
              <span className="assistant-brief-label font-mono">Project Name</span>
              <span className="assistant-brief-value font-bold">{formData.projectName}</span>
            </div>
            <div className="assistant-brief-row assistant-brief-row--column">
              <span className="assistant-brief-label font-mono">Problem Statement</span>
              <p className="assistant-brief-text">{formData.problem}</p>
            </div>
          </div>

          {/* Section 3: Features */}
          <div className="assistant-brief-section">
            <div className="assistant-brief-section__header">
              <span className="assistant-brief-section__num font-mono">03</span>
              <h3 className="assistant-brief-section__title">Features ({formData.features.length})</h3>
              <button
                type="button"
                className="assistant-brief-edit-link font-mono"
                onClick={() => onEditStep(3)}
                aria-label="Edit Features"
              >
                Edit
              </button>
            </div>
            <div className="assistant-brief-features-tags">
              {formData.features.map((feature, idx) => (
                <span key={idx} className="assistant-brief-tag">
                  <span className="assistant-brief-tag__num font-mono">{idx + 1}.</span>
                  <span>{feature}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Scope */}
          <div className="assistant-brief-section">
            <div className="assistant-brief-section__header">
              <span className="assistant-brief-section__num font-mono">04</span>
              <h3 className="assistant-brief-section__title">Scope & Preferences</h3>
              <button
                type="button"
                className="assistant-brief-edit-link font-mono"
                onClick={() => onEditStep(4)}
                aria-label="Edit Scope and Preferences"
              >
                Edit
              </button>
            </div>
            <div className="assistant-brief-grid">
              <div className="assistant-brief-row">
                <span className="assistant-brief-label font-mono">Target Timeline</span>
                <span className="assistant-brief-value">{formData.timeline || 'Not decided'}</span>
              </div>
              <div className="assistant-brief-row">
                <span className="assistant-brief-label font-mono">Budget Expectation</span>
                <span className="assistant-brief-value">{formData.budget || 'Not decided'}</span>
              </div>
              <div className="assistant-brief-row">
                <span className="assistant-brief-label font-mono">Technology Preference</span>
                <span className="assistant-brief-value">
                  {formData.techPreference ? formData.techPreference : 'None specified'}
                </span>
              </div>
            </div>
            {formData.additionalRequirements && (
              <div className="assistant-brief-row assistant-brief-row--column assistant-brief-extra-reqs">
                <span className="assistant-brief-label font-mono">Additional Requirements</span>
                <p className="assistant-brief-text">{formData.additionalRequirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Small Editorial Note */}
        <div className="assistant-editorial-note">
          <span className="assistant-editorial-note__icon" aria-hidden="true">ℹ</span>
          <p className="assistant-editorial-note__text">
            This brief is a starting point. Final scope can be refined after discussing the requirements.
          </p>
        </div>
      </div>
    </AssistantStep>
  );
}
