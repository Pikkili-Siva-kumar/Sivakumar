import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import StatsGrid from '../components/buildStats/StatsGrid';
import ProjectBreakdown from '../components/buildStats/ProjectBreakdown';
import TechnologyCoverage from '../components/buildStats/TechnologyCoverage';
import BuildStatsLinks from '../components/buildStats/BuildStatsLinks';
import { VERIFIED_SKILLS } from '../data/skills';
import { ACTIVE_FOCUS } from '../data/building';
import { projectsApi, servicesApi, blogApi } from '../services/api';
import './BuildStatsPage.css';

/**
 * BuildStatsPage Component
 * Route: /build-stats
 * Step 36: Public Build Stats
 *
 * Provides a factual snapshot of the content and work currently represented on the website.
 * Strictly avoids invented metrics, vanity numbers, or marketing claims.
 */
export default function BuildStatsPage() {
  const [projects, setProjects] = useState([]);
  const [projectsCount, setProjectsCount] = useState(null);
  const [servicesCount, setServicesCount] = useState(null);
  const [blogCount, setBlogCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    projects: false,
    services: false,
    blog: false,
  });

  const skillsCount = VERIFIED_SKILLS.length;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Build Stats | Siva Kumar";

    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      // 1. Fetch Published Projects
      try {
        const pRes = await projectsApi.getPublished();
        if (isMounted) {
          const projs = pRes.projects || [];
          setProjects(projs);
          setProjectsCount(typeof pRes.count === 'number' ? pRes.count : projs.length);
        }
      } catch {
        if (isMounted) {
          setErrors((prev) => ({ ...prev, projects: true }));
        }
      }

      // 2. Fetch Published Services
      try {
        const sRes = await servicesApi.getAll();
        if (isMounted) {
          const servs = sRes.services || [];
          setServicesCount(typeof sRes.count === 'number' ? sRes.count : servs.length);
        }
      } catch {
        if (isMounted) {
          setErrors((prev) => ({ ...prev, services: true }));
        }
      }

      // 3. Fetch Published Blog Articles
      try {
        const bRes = await blogApi.getAll();
        if (isMounted) {
          const posts = bRes.posts || [];
          setBlogCount(typeof bRes.count === 'number' ? bRes.count : posts.length);
        }
      } catch {
        if (isMounted) {
          setErrors((prev) => ({ ...prev, blog: true }));
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="build-stats-page">
      <Container size="default">
        {/* Navigation Breadcrumb / Back Link */}
        <nav className="build-stats-nav" aria-label="Breadcrumb navigation">
          <Link to="/about" className="build-stats-nav__back-link">
            <span className="build-stats-nav__arrow" aria-hidden="true">←</span>
            <span>Back to About</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="build-stats-hero">
          <div className="build-stats-hero__badge badge font-mono">
            <span className="build-stats-hero__badge-dot" aria-hidden="true" />
            <span>BUILD STATS</span>
          </div>

          <h1 className="build-stats-hero__heading">
            What I've Built So Far.
          </h1>

          <p className="build-stats-hero__subheading">
            A factual snapshot of the projects, services, experiments, and resources currently represented on this website.
          </p>

          <p className="build-stats-hero__supporting font-mono">
            Real data. No inflated numbers.
          </p>
        </header>

        <div className="build-stats-content">
          {/* SECTION 1 — CORE COUNTS */}
          <section className="build-stats-section" aria-labelledby="heading-core-counts">
            <div className="build-stats-section__head">
              <span className="build-stats-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-core-counts" className="build-stats-section__title">
                Core Counts
              </h2>
            </div>
            <StatsGrid
              projectsCount={projectsCount}
              servicesCount={servicesCount}
              blogCount={blogCount}
              skillsCount={skillsCount}
              isLoading={isLoading}
              errors={errors}
            />
          </section>

          {/* SECTION 2 — PROJECT BREAKDOWN */}
          <section className="build-stats-section" aria-labelledby="heading-project-breakdown">
            <div className="build-stats-section__head">
              <span className="build-stats-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-project-breakdown" className="build-stats-section__title">
                Projects By Focus
              </h2>
            </div>
            <ProjectBreakdown
              projects={projects}
              isLoading={isLoading}
              error={errors.projects}
            />
          </section>

          {/* SECTION 3 — TECHNOLOGY COVERAGE */}
          <section className="build-stats-section" aria-labelledby="heading-tech-coverage">
            <div className="build-stats-section__head">
              <span className="build-stats-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-tech-coverage" className="build-stats-section__title">
                Technology Across the Work
              </h2>
            </div>
            <TechnologyCoverage
              projects={projects}
              isLoading={isLoading}
              error={errors.projects}
            />
          </section>

          {/* SECTION 4 — CURRENT BUILD AREAS */}
          <section className="build-stats-section" aria-labelledby="heading-current-focus">
            <div className="build-stats-section__head">
              <span className="build-stats-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-current-focus" className="build-stats-section__title">
                Current Areas of Focus
              </h2>
            </div>
            <div className="build-stats-focus-grid" role="region" aria-label="Current build areas">
              {ACTIVE_FOCUS.map((item) => (
                <article key={item.id} className="build-stats-focus-card">
                  <h3 className="build-stats-focus-card__title">{item.title}</h3>
                  <p className="build-stats-focus-card__desc">{item.description}</p>
                  <div className="build-stats-focus-card__topics">
                    {item.topics.map((topic) => (
                      <span key={topic} className="build-stats-focus-card__tag font-mono">
                        {topic}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="build-stats-focus-cta">
              <Link to="/building" className="build-stats-link-forward">
                <span>See What I'm Building</span>
                <span className="build-stats-link-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </section>

          {/* SECTION 5 — EXPLORE THE WORK */}
          <section className="build-stats-section" aria-labelledby="heading-explore-work">
            <div className="build-stats-section__head">
              <span className="build-stats-section__accent-bar" aria-hidden="true" />
              <h2 id="heading-explore-work" className="build-stats-section__title">
                Explore the Work
              </h2>
            </div>
            <BuildStatsLinks />
          </section>

          {/* SECTION 6 — DATA TRANSPARENCY */}
          <section className="build-stats-section" aria-labelledby="heading-data-transparency">
            <div className="build-stats-transparency-card">
              <span className="build-stats-transparency-card__accent-bar" aria-hidden="true" />
              <h2 id="heading-data-transparency" className="build-stats-transparency-card__title">
                About These Numbers
              </h2>
              <p className="build-stats-transparency-card__text">
                These figures are generated from the content currently published on this website. They may change as projects, services, articles, and resources are added or updated.
              </p>
            </div>
          </section>

          {/* SECTION 7 — CTA */}
          <section className="build-stats-section build-stats-section--cta" aria-labelledby="heading-cta">
            <div className="build-stats-cta-card">
              <span className="build-stats-cta-card__accent-bar" aria-hidden="true" />
              <h2 id="heading-cta" className="build-stats-cta-card__title">
                Want to Build Something Here?
              </h2>
              <p className="build-stats-cta-card__text">
                Have a practical problem, project idea, or system requirement? Start with the requirement and build from there.
              </p>
              <div className="build-stats-cta-card__actions">
                <Link to="/start-a-project" className="build-stats-btn build-stats-btn--primary">
                  Start a Project →
                </Link>
                <Link to="/project-assistant" className="build-stats-btn build-stats-btn--secondary">
                  Project Brief Assistant →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
