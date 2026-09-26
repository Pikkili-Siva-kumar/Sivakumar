import React from 'react';
import { WHAT_I_LEARNED } from '../../data/behindTheBuild';

/**
 * LessonsSection
 * Grounded, factual engineering takeaways derived from hands-on implementation.
 */
export default function LessonsSection() {
  return (
    <div className="build-lessons" role="region" aria-label="Engineering Takeaways">
      <div className="build-section-head">
        <span className="build-accent-bar" aria-hidden="true" />
        <h2 className="build-section-title">What the Build Taught Me</h2>
        <p className="build-section-subtitle">
          Core engineering takeaways learned through design iterations, edge-case testing, and integration.
        </p>
      </div>

      <div className="build-lessons__list">
        {WHAT_I_LEARNED.map((lesson) => (
          <div key={lesson.number} className="build-lesson-item">
            <span className="build-lesson-item__num font-mono">
              {lesson.number}
            </span>
            <div className="build-lesson-item__content">
              <h3 className="build-lesson-item__title">
                {lesson.title}
              </h3>
              <p className="build-lesson-item__desc">
                {lesson.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
