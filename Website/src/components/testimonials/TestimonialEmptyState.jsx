import React from 'react';
import './Testimonials.css';

/**
 * TestimonialEmptyState Component
 * Purposeful, transparent empty state shown when no real testimonials are published.
 * Strictly communicates that no reviews are fabricated.
 */
export default function TestimonialEmptyState() {
  return (
    <div className="testimonial-empty-state" role="region" aria-label="Testimonials status">
      <div className="testimonial-empty-state__card">
        <div className="testimonial-empty-state__badge font-mono">
          <span className="testimonial-empty-state__dot" aria-hidden="true" />
          <span>NO TESTIMONIALS YET</span>
        </div>

        <h3 className="testimonial-empty-state__heading">
          Good work should speak for itself.
        </h3>

        <p className="testimonial-empty-state__body">
          I'm keeping this section focused on genuine feedback. Testimonials will appear here when I have real experiences to share.
        </p>

        <div className="testimonial-empty-state__footer">
          <span className="testimonial-empty-state__note font-mono">
            No invented reviews. No filler.
          </span>
        </div>
      </div>
    </div>
  );
}
