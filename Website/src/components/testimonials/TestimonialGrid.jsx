import React from 'react';
import TestimonialCard from './TestimonialCard';
import TestimonialEmptyState from './TestimonialEmptyState';
import './Testimonials.css';

/**
 * TestimonialGrid Component
 * Data-driven grid that renders published testimonials or seamlessly falls back
 * to the intentional empty state when no verified reviews exist.
 */
export default function TestimonialGrid({ testimonials = [] }) {
  const publishedTestimonials = testimonials.filter(
    (item) => item && (item.status === 'published' || !item.status)
  );

  if (publishedTestimonials.length === 0) {
    return <TestimonialEmptyState />;
  }

  return (
    <div className="testimonials-grid" role="region" aria-label="Client & collaborator feedback">
      {publishedTestimonials.map((item) => (
        <TestimonialCard key={item.id} testimonial={item} />
      ))}
    </div>
  );
}
