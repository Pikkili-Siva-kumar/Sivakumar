import React from 'react';
import { BUILD_PROJECTS } from '../../data/behindTheBuild';

/**
 * BuildProjectSelector
 * Accessible two-card toggle for switching between projects in Behind the Build.
 */
export default function BuildProjectSelector({ selectedId, onSelect }) {
  const projects = Object.values(BUILD_PROJECTS);

  return (
    <div className="build-selector" role="region" aria-label="Project Selection">
      <div className="build-selector__head">
        <span className="build-accent-bar" aria-hidden="true" />
        <h2 className="build-selector__title">Choose a Project</h2>
      </div>

      <div
        className="build-selector__grid"
        role="radiogroup"
        aria-label="Available Architecture Case Studies"
      >
        {projects.map((project) => {
          const isActive = project.id === selectedId;

          return (
            <button
              key={project.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              className={`build-selector-card ${isActive ? 'build-selector-card--active' : ''}`}
              onClick={() => onSelect(project.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(project.id);
                }
              }}
            >
              <div className="build-selector-card__top">
                <span className="build-selector-card__number font-mono">
                  {project.number}
                </span>
                <span className="build-selector-card__category font-mono">
                  {project.category}
                </span>
                <span className="build-selector-card__status font-mono">
                  {isActive ? (
                    <span className="build-selector-card__active-dot">
                      <span className="build-selector-card__active-ping" aria-hidden="true" />
                      ACTIVE
                    </span>
                  ) : (
                    'SELECT'
                  )}
                </span>
              </div>

              <h3 className="build-selector-card__title">
                {project.title}
              </h3>

              <p className="build-selector-card__summary">
                {project.summary}
              </p>

              <div className="build-selector-card__tags" aria-label="Key Technologies">
                {project.tags.map((tag) => (
                  <span key={tag} className="build-selector-card__tag font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
