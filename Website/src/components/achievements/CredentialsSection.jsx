import React from 'react';
import './Achievements.css';

/**
 * CredentialsSection Component (Section 2)
 * Renders verified certifications and hackathon participation in a restrained,
 * compact editorial layout. Avoids badge-heavy UI and unverified certificate IDs.
 */
export default function CredentialsSection({ credentials = [] }) {
  return (
    <div className="credentials-grid" role="region" aria-label="Certifications & Participation">
      {credentials.map((item) => (
        <article key={item.id} className="credential-card">
          <div className="credential-card__header">
            <span className="credential-card__type font-mono">{item.type}</span>
            <span className="credential-card__year font-mono">{item.year}</span>
          </div>

          <h3 className="credential-card__title">{item.title}</h3>
          <p className="credential-card__org">{item.organization}</p>
          <p className="credential-card__detail">{item.detail}</p>
        </article>
      ))}
    </div>
  );
}
