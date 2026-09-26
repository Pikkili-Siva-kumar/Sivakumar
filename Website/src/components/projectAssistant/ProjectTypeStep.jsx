import React from 'react';
import AssistantStep from './AssistantStep';
import './ProjectAssistantSteps.css';

const PROJECT_TYPE_OPTIONS = [
  {
    id: 'Web Application',
    title: 'Web Application',
    description: 'Interactive full-stack web applications, client portals, and responsive dashboards.',
  },
  {
    id: 'Backend / API',
    title: 'Backend / API',
    description: 'RESTful API services, server-side business logic, authentication, and system integrations.',
  },
  {
    id: 'Database / SQL',
    title: 'Database / SQL',
    description: 'Relational data modeling, schema architecture, query optimization, and complex joins.',
  },
  {
    id: 'College / Academic Project',
    title: 'College / Academic Project',
    description: 'Final-year student projects, proof-of-concept prototypes, and structured technical documentation.',
  },
  {
    id: 'Custom Software',
    title: 'Custom Software',
    description: 'Bespoke tools, internal operational systems, workflow automation, and custom utilities.',
  },
  {
    id: 'Other',
    title: 'Other',
    description: 'Unique exploratory software requirements, technical consulting, or hybrid applications.',
  },
];

/**
 * ProjectTypeStep Component (Step 1)
 * Guided selection of project category.
 */
export default function ProjectTypeStep({
  selectedType,
  onSelectType,
  onNext,
  onReset,
  error,
}) {
  return (
    <AssistantStep
      stepNumber="01"
      heading="What are you building?"
      subheading="Select the category that best describes what you want to build."
      error={error}
      onNext={onNext}
      onReset={onReset}
      nextLabel="Next: Define Problem →"
    >
      <div
        className="assistant-options-grid"
        role="radiogroup"
        aria-label="Project Type Selection"
        aria-required="true"
      >
        {PROJECT_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedType === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`assistant-option-card ${isSelected ? 'assistant-option-card--selected' : ''}`}
              onClick={() => onSelectType(option.id)}
            >
              <div className="assistant-option-card__radio-indicator" aria-hidden="true">
                <span className={`assistant-radio-circle ${isSelected ? 'assistant-radio-circle--active' : ''}`} />
              </div>
              <div className="assistant-option-card__content">
                <span className="assistant-option-card__title">{option.title}</span>
                <span className="assistant-option-card__desc">{option.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </AssistantStep>
  );
}
