import React from 'react';
import { PLAYGROUND_PROJECTS } from '../../data/playground';

/**
 * PlaygroundSelector Component
 * Allows user to toggle between the Federated Learning and Hotel Booking interactive demos.
 *
 * @param {Object} props
 * @param {string} props.selectedId - Currently selected project ID
 * @param {function} props.onSelect - Callback with new project ID
 */
export default function PlaygroundSelector({ selectedId, onSelect }) {
  return (
    <div className="playground-selector" role="region" aria-label="Select Interactive Demonstration">
      <div className="playground-selector__grid">
        {PLAYGROUND_PROJECTS.map((project) => {
          const isSelected = project.id === selectedId;

          return (
            <article
              key={project.id}
              className={`playground-choice-card ${isSelected ? 'playground-choice-card--selected' : ''}`}
              onClick={() => onSelect(project.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(project.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              aria-label={`Select ${project.title} Demonstration`}
            >
              <div className="playground-choice-card__header">
                <span className="playground-choice-card__status font-mono">
                  {isSelected ? 'ACTIVE DEMO' : 'INTERACTIVE DEMO'}
                </span>
                {isSelected && (
                  <span className="playground-choice-card__active-dot" aria-hidden="true" />
                )}
              </div>

              <h3 className="playground-choice-card__title">
                {project.title}
              </h3>

              <p className="playground-choice-card__summary">
                {project.summary}
              </p>

              <div className="playground-choice-card__tags" aria-label="Technologies used">
                {project.tags.map((tag) => (
                  <span key={tag} className="playground-choice-card__tag font-mono">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="playground-choice-card__action">
                <button
                  type="button"
                  className={`playground-choice-card__btn ${isSelected ? 'playground-choice-card__btn--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(project.id);
                  }}
                >
                  {isSelected ? 'Currently Viewing' : 'Open Playground →'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
