import React from 'react';
import { Link } from 'react-router-dom';
import { JOURNEY_ITEMS } from '../../data/journey';
import './JourneyTimeline.css';

/**
 * JourneyTimeline Component
 * Step 28: Vertical editorial timeline communicating Siva Kumar's path.
 * Renders education, projects, training, and current direction using verified data.
 */
export default function JourneyTimeline() {
  return (
    <div className="journey-timeline" role="region" aria-label="Chronological Journey Timeline">
      <div className="journey-timeline__track">
        {JOURNEY_ITEMS.map((item) => (
          <article key={item.id} className="journey-item">
            {/* Desktop Period Rail */}
            <div className="journey-item__time-col font-mono" aria-hidden="true">
              <span className="journey-item__period">{item.period}</span>
            </div>

            {/* Timeline Spine & Node Dot */}
            <div className="journey-item__spine-col" aria-hidden="true">
              <div className="journey-item__dot" />
            </div>

            {/* Timeline Content Card */}
            <div className="journey-item__card">
              {/* Card Meta: Type & Mobile Period */}
              <div className="journey-item__meta">
                {item.type && (
                  <span className="journey-item__type-badge font-mono">
                    {item.type}
                  </span>
                )}
                <span className="journey-item__mobile-period font-mono">
                  {item.period}
                </span>
              </div>

              {/* Title */}
              <h3 className="journey-item__title">
                {item.title}
              </h3>

              {/* Organization / Context */}
              {item.organization && (
                <p className="journey-item__org">
                  {item.organization}
                </p>
              )}

              {/* Description */}
              <p className="journey-item__desc">
                {item.description}
              </p>

              {/* Topic / Technology Tags */}
              {item.tags && item.tags.length > 0 && (
                <ul className="journey-item__tags" aria-label={`Topics and technologies for ${item.title}`}>
                  {item.tags.map((tag) => (
                    <li key={tag} className="journey-item__tag font-mono">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              {/* Project Action Link */}
              {item.action && (
                <div className="journey-item__action-wrapper">
                  <Link
                    to={item.action.to}
                    className="journey-item__action-btn"
                    aria-label={`${item.action.label} for ${item.title}`}
                  >
                    <span>{item.action.label}</span>
                    <span className="journey-item__action-arrow" aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
