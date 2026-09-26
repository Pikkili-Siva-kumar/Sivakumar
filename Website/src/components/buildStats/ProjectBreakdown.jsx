import React from 'react';
import './BuildStats.css';

/**
 * ProjectBreakdown Component (Section 2)
 * Categorizes published projects by their actual category values.
 * Uses neutral wording and derives all numbers strictly from published data.
 */
export default function ProjectBreakdown({ projects = [], isLoading, error }) {
  if (isLoading) {
    return (
      <div className="build-stats-breakdown-loading">
        <div className="build-stats-skeleton-box" />
        <div className="build-stats-skeleton-box" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="build-stats-error-note font-mono">
        Project category breakdown is currently unavailable.
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="build-stats-empty-note">
        No published projects available at this time.
      </div>
    );
  }

  // Aggregate projects by existing category value
  const categoryMap = {};
  projects.forEach((proj) => {
    const cat = (proj.category || 'General Software').trim();
    if (!categoryMap[cat]) {
      categoryMap[cat] = [];
    }
    categoryMap[cat].push(proj);
  });

  const categories = Object.keys(categoryMap).map((catName) => ({
    name: catName,
    projects: categoryMap[catName],
    count: categoryMap[catName].length,
  }));

  return (
    <div className="project-breakdown-grid" role="region" aria-label="Projects by focus area">
      {categories.map((cat) => (
        <article key={cat.name} className="project-breakdown-card">
          <div className="project-breakdown-card__header">
            <span className="project-breakdown-card__count font-mono">
              {cat.count === 1 ? '1 project' : `${cat.count} projects`}
            </span>
            <h3 className="project-breakdown-card__title">{cat.name}</h3>
          </div>

          <div className="project-breakdown-card__projects">
            <span className="project-breakdown-card__projects-label font-mono">
              PROJECTS:
            </span>
            <ul className="project-breakdown-card__list">
              {cat.projects.map((proj) => (
                <li key={proj.id} className="project-breakdown-card__item">
                  <span className="project-breakdown-card__item-dot" aria-hidden="true" />
                  <span className="project-breakdown-card__item-title">{proj.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
