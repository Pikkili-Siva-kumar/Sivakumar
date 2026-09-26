import React from 'react';
import './BuildStats.css';

/**
 * StatsGrid Component (Section 1)
 * Displays core metrics derived factually from public API endpoints and verified skills data.
 * Includes graceful skeleton loading states and isolated per-metric error states.
 */
export default function StatsGrid({
  projectsCount,
  servicesCount,
  blogCount,
  skillsCount,
  isLoading,
  errors = {},
}) {
  const stats = [
    {
      id: 'projects',
      label: 'Published Projects',
      value: projectsCount,
      detail: 'Verified working systems & case studies',
      error: errors.projects,
    },
    {
      id: 'services',
      label: 'Published Services',
      value: servicesCount,
      detail: 'Core software development offerings',
      error: errors.services,
    },
    {
      id: 'blog',
      label: 'Published Articles',
      value: blogCount,
      detail: 'Technical write-ups & engineering notes',
      error: errors.blog,
    },
    {
      id: 'skills',
      label: 'Verified Skills',
      value: skillsCount,
      detail: 'Languages, frameworks, databases & tools',
      error: false,
    },
  ];

  return (
    <div className="build-stats-grid" role="region" aria-label="Core published counts">
      {stats.map((stat) => (
        <article key={stat.id} className="build-stat-card">
          <div className="build-stat-card__header">
            <span className="build-stat-card__label font-mono">{stat.label}</span>
          </div>

          <div className="build-stat-card__value-wrap">
            {isLoading ? (
              <span className="build-stat-card__skeleton" aria-label="Loading..." />
            ) : stat.error ? (
              <span className="build-stat-card__unavailable font-mono">
                Currently unavailable
              </span>
            ) : (
              <span className="build-stat-card__value font-mono">
                {stat.value !== null && stat.value !== undefined ? stat.value : 0}
              </span>
            )}
          </div>

          <p className="build-stat-card__detail">
            {stat.detail}
          </p>
        </article>
      ))}
    </div>
  );
}
