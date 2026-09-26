import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import TestimonialGrid from '../components/testimonials/TestimonialGrid';
import { TESTIMONIALS } from '../data/testimonials';
import './TestimonialsPage.css';

/**
 * TestimonialsPage Component
 * Route: /testimonials
 * Step 35: Testimonials Feature
 *
 * Designed to showcase genuine client, collaborator, and project feedback.
 * Strictly maintains high data integrity with no invented testimonials or fake reviews.
 */
export default function TestimonialsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Testimonials | Siva Kumar';
  }, []);

  const feedbackCategories = [
    {
      num: '01',
      title: 'Project Feedback',
      desc: 'Feedback from people involved in real software projects.',
    },
    {
      num: '02',
      title: 'Collaboration Feedback',
      desc: 'Feedback from teammates, mentors, or collaborators based on genuine work together.',
    },
    {
      num: '03',
      title: 'Learning & Development',
      desc: 'Feedback connected to practical learning, project work, or technical collaboration.',
    },
  ];

  return (
    <div className="testimonials-page">
      <Container size="default">
        {/* Navigation Breadcrumb */}
        <nav className="testimonials-nav" aria-label="Breadcrumb navigation">
          <Link to="/about" className="testimonials-nav__back-link">
            <span className="testimonials-nav__arrow" aria-hidden="true">←</span>
            <span>Back to About</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="testimonials-hero">
          <div className="testimonials-hero__badge badge font-mono">
            <span className="testimonials-hero__badge-dot" aria-hidden="true" />
            <span>TESTIMONIALS</span>
          </div>

          <h1 className="testimonials-hero__heading">
            What People Say.
          </h1>

          <p className="testimonials-hero__subheading">
            A collection of genuine feedback from people I've worked with, learned with, or built alongside.
          </p>

          <p className="testimonials-hero__supporting font-mono">
            Real experiences will appear here as they become available.
          </p>
        </header>

        <div className="testimonials-content">
          {/* SECTION 1 — TESTIMONIAL GRID */}
          <section className="testimonials-section" aria-labelledby="heading-feedback">
            <div className="testimonials-section__head">
              <span className="testimonials-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-feedback" className="testimonials-section__title">
                Feedback
              </h2>
            </div>

            <TestimonialGrid testimonials={TESTIMONIALS} />
          </section>

          {/* SECTION 2 — WHAT COUNTS AS A TESTIMONIAL */}
          <section className="testimonials-section" aria-labelledby="heading-categories">
            <div className="testimonials-section__head">
              <span className="testimonials-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-categories" className="testimonials-section__title">
                What You'll See Here
              </h2>
            </div>

            <div className="testimonials-categories-grid" role="region" aria-label="Feedback categories">
              {feedbackCategories.map((cat) => (
                <div key={cat.num} className="testimonials-category-card">
                  <div className="testimonials-category-card__header">
                    <span className="testimonials-category-card__num font-mono">{cat.num}</span>
                    <h3 className="testimonials-category-card__title">{cat.title}</h3>
                  </div>
                  <p className="testimonials-category-card__desc">{cat.desc}</p>
                </div>
              ))}
            </div>
            <p className="testimonials-categories-subtext font-mono">
              These categories illustrate the types of genuine feedback that will appear here. No placeholder testimonials are used.
            </p>
          </section>

          {/* SECTION 3 — TRUST PRINCIPLE */}
          <section className="testimonials-section" aria-labelledby="heading-trust">
            <div className="testimonials-trust-card">
              <span className="testimonials-trust-card__accent-bar" aria-hidden="true" />
              <h2 id="heading-trust" className="testimonials-trust-card__title">
                Keep It Real.
              </h2>
              <p className="testimonials-trust-card__text">
                Only genuine feedback should appear here. Names, roles, organizations, and quotes should be added only when they are accurate and appropriate to publish.
              </p>
            </div>
          </section>

          {/* SECTION 4 — WORKED WITH ME CTA */}
          <section className="testimonials-section testimonials-section--cta" aria-labelledby="heading-cta">
            <div className="testimonials-cta-card">
              <span className="testimonials-cta-card__accent-bar" aria-hidden="true" />
              <h2 id="heading-cta" className="testimonials-cta-card__title">
                Worked With Me?
              </h2>
              <p className="testimonials-cta-card__text">
                If we've worked together and you'd like to share your experience, get in touch.
              </p>
              <div className="testimonials-cta-card__actions">
                <Link to="/contact" className="testimonials-btn testimonials-btn--primary">
                  Get in Touch →
                </Link>
                <Link to="/start-a-project" className="testimonials-btn testimonials-btn--secondary">
                  Start a Project →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
