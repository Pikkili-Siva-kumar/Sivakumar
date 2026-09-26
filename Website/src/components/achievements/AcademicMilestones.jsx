import React from 'react';
import './Achievements.css';

/**
 * AcademicMilestones Component (Section 3)
 * Displays verified degree achievements: MCA and B.Sc.
 * Includes institutions, periods, and CGPA scores without invented specializations.
 */
export default function AcademicMilestones({ academics = [] }) {
  return (
    <div className="academic-grid" role="region" aria-label="Academic Foundation">
      {academics.map((item) => (
        <article key={item.id} className="academic-card">
          <div className="academic-card__top">
            <span className="academic-card__degree font-mono">{item.degree}</span>
            <span className="academic-card__period font-mono">{item.period}</span>
          </div>

          <h3 className="academic-card__inst">{item.institution}</h3>

          <div className="academic-card__score-wrap">
            <span className="academic-card__score-label font-mono">SCORE</span>
            <span className="academic-card__score font-mono font-bold">{item.score}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
