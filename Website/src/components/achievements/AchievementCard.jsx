import React from 'react';
import { Link } from 'react-router-dom';
import './Achievements.css';

/**
 * AchievementCard Component
 * Displays an individual verified milestone with year badge, type indicator,
 * description, optional score/technologies, and verified link.
 */
export default function AchievementCard({ milestone }) {
  const {
    year,
    title,
    type,
    organization,
    description,
    score,
    technologies,
    route,
  } = milestone;

  return (
    <article className="achievement-card">
      <div className="achievement-card__header">
        <div className="achievement-card__meta">
          <span className="achievement-card__year font-mono">{year}</span>
          <span className="achievement-card__type font-mono">{type}</span>
        </div>
        {score && (
          <span className="achievement-card__score font-mono">{score}</span>
        )}
      </div>

      <h3 className="achievement-card__title">{title}</h3>

      {organization && (
        <p className="achievement-card__org">{organization}</p>
      )}

      <p className="achievement-card__desc">{description}</p>

      {technologies && technologies.length > 0 && (
        <div className="achievement-card__tech">
          {technologies.map((tech) => (
            <span key={tech} className="achievement-card__tech-tag font-mono">
              {tech}
            </span>
          ))}
        </div>
      )}

      {route && (
        <div className="achievement-card__action">
          <Link to={route} className="achievement-card__link">
            <span>View Project</span>
            <span className="achievement-card__link-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </article>
  );
}
