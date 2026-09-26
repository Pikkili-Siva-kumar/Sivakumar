import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import { ACTIVE_FOCUS, EXPLORATION_TOPICS, WHATS_NEXT } from '../data/building';
import { PROJECTS } from '../data/projects';
import './BuildingPage.css';

/**
 * Currently Building Page Component
 * Route: /building
 * Step 29: What I'm Building Now
 *
 * Answers:
 * 1. What is Siva currently building?
 * 2. What technologies/topics is he currently exploring?
 * 3. What is he planning to build next?
 *
 * Uses strictly verified information from existing project records.
 */
export default function BuildingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "What I'm Building Now | Siva Kumar";
  }, []);

  return (
    <div className="building-page">
      <Container size="default">
        {/* Navigation Breadcrumb / Back Link */}
        <nav className="building-nav" aria-label="Breadcrumb navigation">
          <Link to="/about" className="building-nav__back-link">
            <span className="building-nav__arrow" aria-hidden="true">←</span>
            <span>Back to About</span>
          </Link>
        </nav>

        {/* Hero Header */}
        <header className="building-hero">
          <div className="building-hero__badge badge font-mono">
            <span className="building-hero__badge-dot" aria-hidden="true" />
            <span>CURRENTLY BUILDING</span>
          </div>

          <h1 className="building-hero__heading">
            What I'm Building Now.
          </h1>

          <p className="building-hero__subheading">
            A look at the software, experiments, and ideas I'm currently exploring through hands-on building.
          </p>

          <div className="building-hero__progression font-mono" aria-label="Building philosophy">
            <span className="building-hero__stage">Learn</span>
            <span className="building-hero__arrow" aria-hidden="true">→</span>
            <span className="building-hero__stage">Build</span>
            <span className="building-hero__arrow" aria-hidden="true">→</span>
            <span className="building-hero__stage">Test</span>
            <span className="building-hero__arrow" aria-hidden="true">→</span>
            <span className="building-hero__stage">Refine</span>
          </div>
        </header>

        {/* SECTION 1 — ACTIVE FOCUS */}
        <section className="building-section" aria-labelledby="heading-active-focus">
          <div className="building-section__head">
            <span className="building-section__accent-bar" aria-hidden="true" />
            <h2 id="heading-active-focus" className="building-section__title">
              Current Focus
            </h2>
          </div>

          <div className="building-focus-grid" role="region" aria-label="Active focus areas">
            {ACTIVE_FOCUS.map((item) => (
              <article key={item.id} className="building-card building-card--focus">
                <h3 className="building-card__title">
                  {item.title}
                </h3>
                <p className="building-card__desc">
                  {item.description}
                </p>
                <div className="building-card__topics-group">
                  <span className="building-card__topics-label font-mono">TOPICS</span>
                  <ul className="building-card__tags" aria-label={`Topics for ${item.title}`}>
                    {item.topics.map((topic) => (
                      <li key={topic} className="building-card__tag font-mono">
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 2 — CURRENT PROJECTS */}
        <section className="building-section" aria-labelledby="heading-current-projects">
          <div className="building-section__head">
            <span className="building-section__accent-bar" aria-hidden="true" />
            <h2 id="heading-current-projects" className="building-section__title">
              Projects I'm Building With
            </h2>
            <p className="building-section__subtitle">
              Existing projects that represent the practical systems I build, experiment with, and continue learning from.
            </p>
          </div>

          <div className="building-projects-grid" role="region" aria-label="Representative projects">
            {PROJECTS.map((project) => (
              <article key={project.id} className="building-card building-card--project">
                <div className="building-card__project-meta">
                  <span className="building-card__project-number font-mono">{project.number}</span>
                  <span className="building-card__project-category">{project.category}</span>
                </div>

                <h3 className="building-card__title">
                  {project.title}
                </h3>

                <p className="building-card__desc">
                  {project.description}
                </p>

                <div className="building-card__topics-group">
                  <span className="building-card__topics-label font-mono">STACK</span>
                  <ul className="building-card__tags" aria-label={`Technologies used in ${project.title}`}>
                    {project.technologies.map((tech) => (
                      <li key={tech} className="building-card__tag font-mono">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="building-card__action">
                  <Link
                    to={`/work/${project.id}`}
                    className="building-card__btn"
                    aria-label={`View Project Case Study for ${project.title}`}
                  >
                    <span>View Project</span>
                    <span className="building-card__btn-arrow" aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 3 — EXPLORING */}
        <section className="building-section" aria-labelledby="heading-exploring">
          <div className="building-section__head">
            <span className="building-section__accent-bar" aria-hidden="true" />
            <h2 id="heading-exploring" className="building-section__title">
              What I'm Exploring
            </h2>
          </div>

          <div className="building-exploring-grid" role="region" aria-label="Exploration topics">
            {EXPLORATION_TOPICS.map((topic, index) => (
              <div key={topic.id} className="building-exploring-item">
                <span className="building-exploring-item__num font-mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="building-exploring-item__name">
                  {topic.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4 — BUILDING NEXT */}
        <section className="building-section" aria-labelledby="heading-whats-next">
          <div className="building-next-card">
            <div className="building-section__head building-section__head--compact">
              <span className="building-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-whats-next" className="building-section__title">
                {WHATS_NEXT.heading}
              </h2>
            </div>
            <p className="building-next-card__desc">
              {WHATS_NEXT.description}
            </p>
          </div>
        </section>

        {/* Subtle Discovery Bridge to Digital Products */}
        <div className="building-products-bridge">
          <span className="building-products-bridge__text font-mono">
            Practical templates, checklists, and developer resources created from real work:
          </span>
          <Link to="/digital-products" className="building-products-bridge__link font-mono">
            Explore Digital Products →
          </Link>
        </div>

        {/* SECTION 5 — FINAL CTA */}
        <section className="building-cta-section" aria-labelledby="heading-building-cta">
          <div className="building-cta-card">
            <span className="building-cta__accent-bar" aria-hidden="true" />
            <h2 id="heading-building-cta" className="building-cta__heading">
              Have Something Worth Building?
            </h2>
            <p className="building-cta__text">
              Have a real problem or project idea? Let's turn the requirement into something practical.
            </p>
            <div className="building-cta__actions">
              <Link to="/start-a-project" className="building-cta__btn building-cta__btn--primary">
                Start a Project →
              </Link>
              <Link to="/work" className="building-cta__btn building-cta__btn--secondary">
                View My Work
              </Link>
            </div>
            <div className="building-assistant-hint font-mono">
              <span>Need help shaping the requirements first?</span>{' '}
              <Link to="/project-assistant" className="building-assistant-link">
                Use the Project Brief Assistant →
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
