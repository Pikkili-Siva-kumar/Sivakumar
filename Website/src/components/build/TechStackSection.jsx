import React from 'react';

/**
 * TechStackSection
 * Verified technology breakdown strictly grounded in existing project data.
 */
export default function TechStackSection({ project }) {
  const techs = project.technologies || [];

  return (
    <div className="build-tech" role="region" aria-label={`Technology Stack for ${project.title}`}>
      <div className="build-section-head">
        <span className="build-accent-bar" aria-hidden="true" />
        <h2 className="build-section-title">Technology Behind the Build</h2>
        <p className="build-section-subtitle">
          Verified tools, libraries, and frameworks utilized to construct this system without extraneous bloat.
        </p>
      </div>

      <div className="build-tech__grid">
        {techs.map((tech) => (
          <div key={tech.name} className="build-tech-card">
            <div className="build-tech-card__top">
              <span className="build-tech-card__name font-mono">{tech.name}</span>
              <span className="build-tech-card__verified font-mono">VERIFIED</span>
            </div>
            <p className="build-tech-card__role">
              {tech.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
