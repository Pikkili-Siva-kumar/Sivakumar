import React from 'react';
import { TESTING_PRACTICES } from '../../data/behindTheBuild';

/**
 * TestingSection
 * Editorial overview of testing and verification practices grounded in real project behaviors.
 */
export default function TestingSection() {
  return (
    <div className="build-testing" role="region" aria-label="Testing & Verification Methodologies">
      <div className="build-section-head">
        <span className="build-accent-bar" aria-hidden="true" />
        <h2 className="build-section-title">How I Test the Systems</h2>
        <p className="build-section-subtitle">
          Disciplined verification practices applied to ensure algorithmic correctness and system stability.
        </p>
      </div>

      <div className="build-testing__grid">
        {TESTING_PRACTICES.map((practice) => (
          <article key={practice.number} className="build-testing-card">
            <div className="build-testing-card__header">
              <span className="build-testing-card__num font-mono">
                {practice.number}
              </span>
              <h3 className="build-testing-card__title">
                {practice.title}
              </h3>
            </div>

            <p className="build-testing-card__summary font-mono">
              {practice.summary}
            </p>

            <p className="build-testing-card__desc">
              {practice.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
