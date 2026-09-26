import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import AchievementTimeline from '../components/achievements/AchievementTimeline';
import CredentialsSection from '../components/achievements/CredentialsSection';
import AcademicMilestones from '../components/achievements/AcademicMilestones';
import {
  VERIFIED_MILESTONES,
  CREDENTIALS,
  ACADEMIC_MILESTONES,
  PROJECT_MILESTONES,
  MILESTONE_MEANINGS,
} from '../data/achievements';
import './AchievementsPage.css';

/**
 * AchievementsPage Component
 * Route: /achievements
 * Step 37: Achievements Feature
 *
 * Provides a factual record of academic milestones, training certifications,
 * participation, and notable completed software systems.
 * Strictly adheres to verified data integrity with zero inflated claims.
 */
export default function AchievementsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Achievements & Milestones | Siva Kumar';
  }, []);

  return (
    <div className="achievements-page">
      <Container size="default">
        {/* Navigation Breadcrumb / Back Link */}
        <nav className="achievements-nav" aria-label="Breadcrumb navigation">
          <Link to="/about" className="achievements-nav__back-link">
            <span className="achievements-nav__arrow" aria-hidden="true">←</span>
            <span>Back to About</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="achievements-hero">
          <div className="achievements-hero__badge badge font-mono">
            <span className="achievements-hero__badge-dot" aria-hidden="true" />
            <span>ACHIEVEMENTS</span>
          </div>

          <h1 className="achievements-hero__heading">
            Milestones Along the Way.
          </h1>

          <p className="achievements-hero__subheading">
            A factual record of the academic, learning, participation, and project milestones that have shaped my development journey.
          </p>

          <p className="achievements-hero__supporting font-mono">
            Verified milestones. No inflated claims.
          </p>
        </header>

        <div className="achievements-content">
          {/* SECTION 1 — FEATURED MILESTONES */}
          <section className="achievements-section" aria-labelledby="heading-featured-milestones">
            <div className="achievements-section__head">
              <span className="achievements-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-featured-milestones" className="achievements-section__title">
                Featured Milestones
              </h2>
            </div>
            <AchievementTimeline milestones={VERIFIED_MILESTONES} />
          </section>

          {/* SECTION 2 — CREDENTIALS */}
          <section className="achievements-section" aria-labelledby="heading-credentials">
            <div className="achievements-section__head">
              <span className="achievements-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-credentials" className="achievements-section__title">
                Certifications & Participation
              </h2>
            </div>
            <CredentialsSection credentials={CREDENTIALS} />
          </section>

          {/* SECTION 3 — ACADEMIC MILESTONES */}
          <section className="achievements-section" aria-labelledby="heading-academic-milestones">
            <div className="achievements-section__head">
              <span className="achievements-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-academic-milestones" className="achievements-section__title">
                Academic Foundation
              </h2>
            </div>
            <AcademicMilestones academics={ACADEMIC_MILESTONES} />
          </section>

          {/* SECTION 4 — PROJECT MILESTONES */}
          <section className="achievements-section" aria-labelledby="heading-project-milestones">
            <div className="achievements-section__head">
              <span className="achievements-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-project-milestones" className="achievements-section__title">
                Built as Milestones
              </h2>
            </div>
            <div className="project-milestones-grid" role="region" aria-label="Projects built as milestones">
              {PROJECT_MILESTONES.map((proj) => (
                <article key={proj.id} className="project-milestone-card">
                  <div className="project-milestone-card__header">
                    <span className="project-milestone-card__badge font-mono">PROJECT</span>
                    <span className="project-milestone-card__year font-mono">{proj.year}</span>
                  </div>

                  <h3 className="project-milestone-card__title">{proj.name}</h3>
                  <p className="project-milestone-card__desc">{proj.description}</p>

                  <div className="project-milestone-card__tech">
                    {proj.technologies.map((t) => (
                      <span key={t} className="project-milestone-card__tech-tag font-mono">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="project-milestone-card__action">
                    <Link to={proj.route} className="project-milestone-card__link">
                      <span>View Project</span>
                      <span className="project-milestone-card__link-arrow" aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 5 — WHAT THESE MILESTONES REPRESENT */}
          <section className="achievements-section" aria-labelledby="heading-milestone-meaning">
            <div className="achievements-section__head">
              <span className="achievements-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-milestone-meaning" className="achievements-section__title">
                What These Milestones Mean
              </h2>
            </div>
            <div className="milestone-meanings-grid" role="region" aria-label="Meaning of milestones">
              {MILESTONE_MEANINGS.map((meaning) => (
                <article key={meaning.num} className="meaning-card">
                  <span className="meaning-card__num font-mono">{meaning.num}</span>
                  <h3 className="meaning-card__title">{meaning.title}</h3>
                  <p className="meaning-card__desc">{meaning.description}</p>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 6 — DATA TRANSPARENCY */}
          <section className="achievements-section" aria-labelledby="heading-data-transparency">
            <div className="achievements-transparency-card">
              <span className="achievements-transparency-card__accent-bar" aria-hidden="true" />
              <h2 id="heading-data-transparency" className="achievements-transparency-card__title">
                About These Milestones
              </h2>
              <p className="achievements-transparency-card__text">
                These milestones are based on the information currently represented in this website and verified project/education records. As new genuine achievements are completed, this page can be updated.
              </p>
            </div>
          </section>

          {/* SECTION 7 — CTA */}
          <section className="achievements-section achievements-section--cta" aria-labelledby="heading-cta">
            <div className="achievements-cta-card">
              <span className="achievements-cta-card__accent-bar" aria-hidden="true" />
              <h2 id="heading-cta" className="achievements-cta-card__title">
                Keep Building.
              </h2>
              <p className="achievements-cta-card__text">
                The milestones matter, but the work continues through practical projects, experiments, and real requirements.
              </p>
              <div className="achievements-cta-card__actions">
                <Link to="/about/journey" className="achievements-btn achievements-btn--secondary">
                  View My Journey →
                </Link>
                <Link to="/building" className="achievements-btn achievements-btn--secondary">
                  See What I'm Building →
                </Link>
                <Link to="/start-a-project" className="achievements-btn achievements-btn--primary">
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
