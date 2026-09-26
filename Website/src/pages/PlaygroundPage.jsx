import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Container from '../components/common/Container';
import PlaygroundSelector from '../components/playground/PlaygroundSelector';
import HotelBookingPlayground from '../components/playground/HotelBookingPlayground';
import FederatedLearningPlayground from '../components/playground/FederatedLearningPlayground';
import { ENGINEERING_NOTES } from '../data/playground';
import '../components/playground/Playground.css';
import './PlaygroundPage.css';

/**
 * PlaygroundPage Component
 * Route: /playground
 * Step 30: Live Project Playground
 *
 * Dedicated interactive demonstrations of room availability logic (Hotel Management)
 * and multi-stage pipeline workflows (Federated Learning).
 */
export default function PlaygroundPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProject = searchParams.get('project') || 'federated-learning-6g';
  const [selectedProject, setSelectedProject] = useState(initialProject);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Project Playground | Siva Kumar';
  }, []);

  const handleSelectProject = (id) => {
    setSelectedProject(id);
    setSearchParams({ project: id });
  };

  return (
    <div className="playground-page">
      <Container size="default">
        {/* Navigation Breadcrumb */}
        <nav className="playground-nav" aria-label="Breadcrumb navigation">
          <Link to="/work" className="playground-nav__back-link">
            <span className="playground-nav__arrow" aria-hidden="true">←</span>
            <span>Back to Selected Work</span>
          </Link>
        </nav>

        {/* Hero Header */}
        <header className="playground-hero">
          <div className="playground-hero__badge badge font-mono">
            <span className="playground-hero__badge-dot" aria-hidden="true" />
            <span>PROJECT PLAYGROUND</span>
          </div>

          <h1 className="playground-hero__heading">
            Try the Projects.
          </h1>

          <p className="playground-hero__subheading">
            Interactive demonstrations of the systems and engineering workflows behind my projects.
          </p>

          <p className="playground-hero__micro-line font-mono">
            Choose a project → change the inputs → see what happens.
          </p>

          <div className="playground-hero__note-card">
            <span className="playground-hero__note-icon font-mono" aria-hidden="true">ℹ</span>
            <span className="playground-hero__note-text">
              These are browser-based demonstrations based on the underlying project workflows.
            </span>
          </div>
        </header>

        {/* SECTION 1 — PROJECT SELECTOR */}
        <section className="playground-section" aria-labelledby="heading-select-demo">
          <div className="playground-section__head">
            <span className="playground-section__accent-bar" aria-hidden="true" />
            <h2 id="heading-select-demo" className="playground-section__title">
              Select an Interactive Demo
            </h2>
          </div>

          <PlaygroundSelector
            selectedId={selectedProject}
            onSelect={handleSelectProject}
          />
        </section>

        {/* SECTION 2 & 3 — ACTIVE INTERACTIVE DEMONSTRATION */}
        <section className="playground-section" aria-label="Active Interactive Demonstration">
          {selectedProject === 'federated-learning-6g' ? (
            <FederatedLearningPlayground />
          ) : (
            <HotelBookingPlayground />
          )}
        </section>

        {/* SECTION 4 — ENGINEERING NOTES */}
        <section className="playground-section" aria-labelledby="heading-engineering-notes">
          <div className="playground-section__head">
            <span className="playground-section__accent-bar" aria-hidden="true" />
            <h2 id="heading-engineering-notes" className="playground-section__title">
              What These Demos Show.
            </h2>
          </div>

          <div className="playground-notes-grid" role="region" aria-label="Key engineering takeaways">
            {ENGINEERING_NOTES.map((note) => (
              <article key={note.number} className="playground-note-card">
                <span className="playground-note-card__num font-mono">
                  {note.number}
                </span>
                <h3 className="playground-note-card__title">
                  {note.title}
                </h3>
                <p className="playground-note-card__desc">
                  {note.description}
                </p>
              </article>
            ))}
          </div>

          {/* Subtle Discovery Bridge to Behind the Build */}
          <div className="playground-build-bridge">
            <span className="playground-build-bridge__text font-mono">
              Curious about the architecture, decisions, and data flow?
            </span>
            <Link
              to={selectedProject ? `/behind-the-build?project=${selectedProject}` : '/behind-the-build'}
              className="playground-build-bridge__link font-mono"
            >
              See How It's Built →
            </Link>
          </div>
        </section>

        {/* SECTION 5 — FINAL CTA */}
        <section className="playground-cta-section" aria-labelledby="heading-playground-cta">
          <div className="playground-cta-card">
            <span className="playground-cta__accent-bar" aria-hidden="true" />
            <h2 id="heading-playground-cta" className="playground-cta__heading">
              Want to Build Something Real?
            </h2>
            <p className="playground-cta__text">
              These playgrounds are demonstrations. Real projects start with a real requirement, workflow, and set of constraints.
            </p>
            <div className="playground-cta__actions">
              <Link to="/start-a-project" className="playground-cta__btn playground-cta__btn--primary">
                Start a Project →
              </Link>
              <Link to="/contact" className="playground-cta__btn playground-cta__btn--secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
