import React from 'react';

/**
 * EngineeringDecisions
 * Editorial cards detailing the 4 critical architectural decisions behind the system.
 */
export default function EngineeringDecisions({ project }) {
  const decisions = project.decisions || [];

  return (
    <div className="build-decisions" role="region" aria-label={`Engineering Decisions for ${project.title}`}>
      <div className="build-section-head">
        <span className="build-accent-bar" aria-hidden="true" />
        <h2 className="build-section-title">Engineering Decisions</h2>
        <p className="build-section-subtitle">
          Core architectural rationales, trade-offs, and boundary decisions evaluated during implementation.
        </p>
      </div>

      <div className="build-decisions__grid">
        {decisions.map((decision) => (
          <article key={decision.number} className="build-decision-card">
            <div className="build-decision-card__top">
              <span className="build-decision-card__num font-mono">
                DECISION {decision.number}
              </span>
              <span className="build-decision-card__topic font-mono">
                {decision.topic}
              </span>
            </div>

            <h3 className="build-decision-card__title">
              {decision.title}
            </h3>

            <p className="build-decision-card__desc">
              {decision.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
