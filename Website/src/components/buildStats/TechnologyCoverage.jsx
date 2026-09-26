import React from 'react';
import './BuildStats.css';

/**
 * TechnologyCoverage Component (Section 3)
 * Displays factual occurrence counts of technologies used across published projects.
 * Avoids arbitrary percentages, rankings, or fake skill bars.
 */
export default function TechnologyCoverage({ projects = [], isLoading, error }) {
  if (isLoading) {
    return (
      <div className="build-stats-coverage-loading">
        <div className="build-stats-skeleton-box" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="build-stats-error-note font-mono">
        Technology coverage data is currently unavailable.
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="build-stats-empty-note">
        No published project technologies to summarize.
      </div>
    );
  }

  // Count technology occurrences across all published projects
  const techCounts = {};

  projects.forEach((proj) => {
    let techs = proj.technologies || [];
    if (typeof techs === 'string') {
      try {
        techs = JSON.parse(techs);
      } catch {
        techs = techs.split(',').map((t) => t.trim());
      }
    }
    if (Array.isArray(techs)) {
      techs.forEach((t) => {
        const trimmed = (t || '').trim();
        if (trimmed) {
          techCounts[trimmed] = (techCounts[trimmed] || 0) + 1;
        }
      });
    }
  });

  // Sort by count descending, then alphabetical
  const techList = Object.keys(techCounts)
    .map((tech) => ({
      name: tech,
      count: techCounts[tech],
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <div className="tech-coverage-grid" role="region" aria-label="Technology occurrence summary">
      {techList.map((item) => (
        <div key={item.name} className="tech-coverage-card">
          <div className="tech-coverage-card__main">
            <span className="tech-coverage-card__name font-bold">{item.name}</span>
            <span className="tech-coverage-card__count font-mono">
              Used in {item.count} {item.count === 1 ? 'project' : 'projects'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
