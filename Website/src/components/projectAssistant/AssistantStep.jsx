import React from 'react';
import './AssistantStep.css';

/**
 * AssistantStep Component
 * Common card wrapper for each step with header, error banner, body, and navigation actions.
 */
export default function AssistantStep({
  stepNumber,
  heading,
  subheading,
  error,
  children,
  onBack,
  onNext,
  onReset,
  nextLabel = 'Next Step →',
  showNext = true,
  customActions = null,
}) {
  return (
    <section className="assistant-step-card" aria-labelledby={`step-heading-${stepNumber}`}>
      {/* Step Header */}
      <header className="assistant-step-card__header">
        <div className="assistant-step-card__badge font-mono">
          <span>STEP {stepNumber}</span>
        </div>
        <h2 id={`step-heading-${stepNumber}`} className="assistant-step-card__heading">
          {heading}
        </h2>
        {subheading && (
          <p className="assistant-step-card__subheading">
            {subheading}
          </p>
        )}
      </header>

      {/* Inline Validation Error Notification */}
      {error && (
        <div
          className="assistant-step-error"
          role="alert"
          aria-live="assertive"
        >
          <span className="assistant-step-error__icon" aria-hidden="true">⚠</span>
          <span className="assistant-step-error__text">{error}</span>
        </div>
      )}

      {/* Main Step Form / Controls Body */}
      <div className="assistant-step-card__body">
        {children}
      </div>

      {/* Footer Navigation Bar */}
      <footer className="assistant-step-card__footer">
        {customActions ? (
          customActions
        ) : (
          <div className="assistant-step-nav">
            <div className="assistant-step-nav__left">
              {onBack && (
                <button
                  type="button"
                  className="assistant-btn assistant-btn--secondary"
                  onClick={onBack}
                >
                  ← Back
                </button>
              )}
              {onReset && (
                <button
                  type="button"
                  className="assistant-btn assistant-btn--ghost"
                  onClick={onReset}
                  title="Clear all fields and start over"
                >
                  Start Over
                </button>
              )}
            </div>

            <div className="assistant-step-nav__right">
              {showNext && (
                <button
                  type="button"
                  className="assistant-btn assistant-btn--primary"
                  onClick={onNext}
                >
                  {nextLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </footer>
    </section>
  );
}
