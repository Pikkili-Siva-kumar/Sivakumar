import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BuildActions
 * Section 8: Related Actions
 * Direct navigation links to the Case Study, Interactive Playground, and Full Work directory.
 */
export default function BuildActions({ project }) {
  return (
    <div className="build-actions" role="region" aria-label="Explore Related Project Views">
      <div className="build-section-head">
        <span className="build-accent-bar" aria-hidden="true" />
        <h2 className="build-section-title">Explore the Build</h2>
        <p className="build-section-subtitle">
          Examine the narrative case study, interact with the live demonstration, or return to selected work.
        </p>
      </div>

      <div className="build-actions__buttons">
        <Link
          to={project.caseStudyRoute}
          className="build-action-btn build-action-btn--primary"
        >
          View Case Study →
        </Link>

        <Link
          to={project.playgroundRoute}
          className="build-action-btn build-action-btn--secondary"
        >
          Try Interactive Demo →
        </Link>

        <Link
          to="/work"
          className="build-action-btn build-action-btn--outline"
        >
          View All Projects →
        </Link>
      </div>
    </div>
  );
}
