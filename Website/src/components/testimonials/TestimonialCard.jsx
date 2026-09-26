import React from 'react';
import './Testimonials.css';

/**
 * TestimonialCard Component
 * Reusable presentation card for genuine testimonials.
 * Supports all optional metadata fields without rendering empty labels for missing data.
 */
export default function TestimonialCard({ testimonial }) {
  if (!testimonial) return null;

  const {
    quote,
    name,
    role,
    organization,
    relationship,
    avatarUrl,
    project,
    date,
    featured,
  } = testimonial;

  // Render author initials as fallback avatar if avatarUrl is provided but fails or as placeholder
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <article
      className={`testimonial-card ${featured ? 'testimonial-card--featured' : ''}`}
      aria-label={`Testimonial from ${name}`}
    >
      {/* Top Meta: Relationship Badge and Project */}
      <div className="testimonial-card__header">
        {relationship && (
          <span className="testimonial-card__badge font-mono">{relationship}</span>
        )}
        {project && (
          <span className="testimonial-card__project font-mono" title={`Project: ${project}`}>
            {project}
          </span>
        )}
      </div>

      {/* Quote Body */}
      <blockquote className="testimonial-card__quote">
        <p className="testimonial-card__text">“{quote}”</p>
      </blockquote>

      {/* Author & Credential Details */}
      <footer className="testimonial-card__footer">
        <div className="testimonial-card__author-media">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="testimonial-card__avatar"
              loading="lazy"
            />
          ) : (
            <div className="testimonial-card__avatar-fallback font-mono" aria-hidden="true">
              {initials}
            </div>
          )}
        </div>

        <div className="testimonial-card__author-info">
          <cite className="testimonial-card__name font-bold not-italic">{name}</cite>
          {(role || organization) && (
            <p className="testimonial-card__role">
              {role && <span>{role}</span>}
              {role && organization && <span className="testimonial-card__role-sep">, </span>}
              {organization && <span className="testimonial-card__org">{organization}</span>}
            </p>
          )}
          {date && (
            <time className="testimonial-card__date font-mono" dateTime={date}>
              {date}
            </time>
          )}
        </div>
      </footer>
    </article>
  );
}
