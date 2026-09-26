import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import JourneyTimeline from '../components/journey/JourneyTimeline';
import './JourneyPage.css';

/**
 * JourneyPage Component
 * Route: /about/journey
 * Step 28: Personal Journey / Timeline
 *
 * Communicates Siva Kumar's path:
 * Education background → practical projects → learning/training → current direction.
 * Uses only verified real information from the resume and project records.
 */
export default function JourneyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'My Journey | Siva Kumar — Python Full Stack Developer';
  }, []);

  return (
    <div className="journey-page">
      <Container size="default">
        {/* Navigation Breadcrumb / Back Link */}
        <nav className="journey-nav" aria-label="Breadcrumb navigation">
          <Link to="/about" className="journey-nav__back-link">
            <span className="journey-nav__arrow" aria-hidden="true">←</span>
            <span>Back to About</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="journey-hero">
          <div className="journey-hero__badge badge font-mono">
            <span className="journey-hero__badge-dot" aria-hidden="true" />
            <span>MY JOURNEY</span>
          </div>

          <h1 className="journey-hero__heading">
            How I Got Here.
          </h1>

          <p className="journey-hero__subheading">
            A timeline of the education, projects, and learning experiences that shaped my path into Python Full Stack development.
          </p>

          {/* Visual Progression Detail */}
          <div className="journey-hero__progression font-mono" aria-label="Progression stages">
            <span className="journey-hero__stage">Education</span>
            <span className="journey-hero__arrow" aria-hidden="true">→</span>
            <span className="journey-hero__stage">Projects</span>
            <span className="journey-hero__arrow" aria-hidden="true">→</span>
            <span className="journey-hero__stage">Learning</span>
            <span className="journey-hero__arrow" aria-hidden="true">→</span>
            <span className="journey-hero__stage">Building</span>
          </div>
        </header>

        {/* Timeline Content Section */}
        <section className="journey-section" aria-label="Timeline entries">
          <JourneyTimeline />
        </section>

        {/* Bottom CTA Card */}
        <section className="journey-cta-section" aria-labelledby="journey-cta-heading">
          <div className="journey-cta-card">
            <span className="journey-cta__accent-bar" aria-hidden="true" />
            <h2 id="journey-cta-heading" className="journey-cta__heading">
              Still building the next chapter.
            </h2>
            <p className="journey-cta__text">
              I'm continuing to learn, build practical software, and turn real-world requirements into usable applications.
            </p>
            <div className="journey-cta__actions">
              <Link to="/work" className="journey-cta__btn journey-cta__btn--primary">
                View My Work
              </Link>
              <Link to="/achievements" className="journey-cta__btn journey-cta__btn--secondary">
                View Milestones →
              </Link>
              <Link to="/start-a-project" className="journey-cta__btn journey-cta__btn--secondary">
                Start a Project
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
