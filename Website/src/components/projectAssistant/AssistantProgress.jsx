import React from 'react';
import './AssistantProgress.css';

/**
 * AssistantProgress Component
 * Visual step progress indicator for the Project Brief Assistant (Steps 1 to 5).
 * Fully accessible with semantic ordered list and aria-current attributes.
 */
export default function AssistantProgress({ currentStep, steps, onStepClick }) {
  return (
    <nav className="assistant-progress" aria-label="Project Brief Progress">
      <ol className="assistant-progress__list">
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCurrent = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const isClickable = isCompleted && onStepClick;

          let statusClass = 'assistant-progress__item--upcoming';
          if (isCurrent) statusClass = 'assistant-progress__item--current';
          else if (isCompleted) statusClass = 'assistant-progress__item--completed';

          return (
            <li
              key={step.number}
              className={`assistant-progress__item ${statusClass}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <button
                type="button"
                className="assistant-progress__btn"
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                aria-label={`Step ${step.number}: ${step.title}${isCompleted ? ' (Completed)' : isCurrent ? ' (Current)' : ''}`}
              >
                <span className="assistant-progress__indicator font-mono">
                  {isCompleted ? (
                    <span className="assistant-progress__check" aria-hidden="true">✓</span>
                  ) : (
                    step.number
                  )}
                </span>
                <span className="assistant-progress__label">
                  <span className="assistant-progress__sub font-mono">STEP {step.number}</span>
                  <span className="assistant-progress__title">{step.title}</span>
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`assistant-progress__track ${isCompleted ? 'assistant-progress__track--filled' : ''}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
