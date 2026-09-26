import React from 'react';
import AchievementCard from './AchievementCard';
import './Achievements.css';

/**
 * AchievementTimeline Component (Section 1)
 * Renders the 6 verified featured milestones in an editorial milestone grid/timeline.
 */
export default function AchievementTimeline({ milestones = [] }) {
  return (
    <div className="achievement-timeline" role="region" aria-label="Verified Milestones Timeline">
      <div className="achievement-timeline__track" aria-hidden="true" />
      <div className="achievement-timeline__list">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="achievement-timeline__item">
            <div className="achievement-timeline__marker" aria-hidden="true">
              <span className="achievement-timeline__dot" />
            </div>
            <div className="achievement-timeline__content">
              <AchievementCard milestone={milestone} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
