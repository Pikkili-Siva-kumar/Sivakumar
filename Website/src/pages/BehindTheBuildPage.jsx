import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import { BUILD_PROJECTS } from '../data/behindTheBuild';

import BuildProjectSelector from '../components/build/BuildProjectSelector';
import ArchitectureFlow from '../components/build/ArchitectureFlow';
import EngineeringDecisions from '../components/build/EngineeringDecisions';
import DataFlow from '../components/build/DataFlow';
import TestingSection from '../components/build/TestingSection';
import TechStackSection from '../components/build/TechStackSection';
import LessonsSection from '../components/build/LessonsSection';
import BuildActions from '../components/build/BuildActions';

import '../components/build/BehindTheBuild.css';
import './BehindTheBuildPage.css';

/**
 * BehindTheBuildPage
 * Step 31: Build the "Behind the Build" Feature
 *
 * Dedicated architectural deep-dive into how Siva's verified projects are built,
 * tested, and integrated.
 *
 * Supports URL query parameter:
 * /behind-the-build?project=federated-learning-6g
 * /behind-the-build?project=luxury-hotel-management
 * Defaults to 'federated-learning-6g'.
 */
export default function BehindTheBuildPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawProjectParam = searchParams.get('project');

  // Validate query parameter against valid projects; fallback to default
  const selectedProjectId = useMemo(() => {
    if (rawProjectParam && BUILD_PROJECTS[rawProjectParam]) {
      return rawProjectParam;
    }
    return 'federated-learning-6g';
  }, [rawProjectParam]);

  const currentProject = BUILD_PROJECTS[selectedProjectId];

  useEffect(() => {
    document.title = 'Behind the Build — Architecture & Engineering | Siva Kumar';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSelectProject = (projectId) => {
    if (BUILD_PROJECTS[projectId]) {
      setSearchParams({ project: projectId }, { replace: true });
    }
  };

  return (
    <div className="behind-the-build-page">
      <Container size="default">
        {/* PAGE HERO */}
        <header className="build-hero" aria-labelledby="hero-title">
          <div className="build-hero__badge font-mono">
            <span className="build-hero__badge-dot" aria-hidden="true" />
            <span>BEHIND THE BUILD</span>
          </div>

          <h1 id="hero-title" className="build-hero__title">
            How the Systems Come Together.
          </h1>

          <p className="build-hero__subheading">
            A closer look at the architecture, workflows, validation, and engineering decisions behind my projects.
          </p>

          <p className="build-hero__supporting font-mono">
            Problem → Architecture → Implementation → Testing
          </p>
        </header>

        {/* SECTION 1 — PROJECT SELECTOR */}
        <section className="build-page-section" aria-label="Project Selector">
          <BuildProjectSelector
            selectedId={selectedProjectId}
            onSelect={handleSelectProject}
          />
        </section>

        {/* SECTION 2 — SYSTEM ARCHITECTURE */}
        <section className="build-page-section" aria-label="System Architecture Flow">
          <ArchitectureFlow project={currentProject} />
        </section>

        {/* SECTION 3 — ENGINEERING DECISIONS */}
        <section className="build-page-section" aria-label="Engineering Decisions">
          <EngineeringDecisions project={currentProject} />
        </section>

        {/* SECTION 4 — REQUEST / DATA FLOW */}
        <section className="build-page-section" aria-label="Request and Data Flow">
          <DataFlow project={currentProject} />
        </section>

        {/* SECTION 5 — VALIDATION & TESTING */}
        <section className="build-page-section" aria-label="Validation and Testing Methodologies">
          <TestingSection />
        </section>

        {/* SECTION 6 — TECHNOLOGY STACK */}
        <section className="build-page-section" aria-label="Verified Technology Stack">
          <TechStackSection project={currentProject} />
        </section>

        {/* SECTION 7 — WHAT I LEARNED */}
        <section className="build-page-section" aria-label="Engineering Takeaways">
          <LessonsSection />
        </section>

        {/* SECTION 8 — RELATED ACTIONS */}
        <section className="build-page-section" aria-label="Related Actions">
          <BuildActions project={currentProject} />
        </section>

        {/* SECTION 9 — BOTTOM CTA */}
        <section className="build-page-section build-cta-section" aria-labelledby="heading-build-cta">
          <div className="build-cta-card">
            <span className="build-accent-bar" aria-hidden="true" />
            <h2 id="heading-build-cta" className="build-cta__heading">
              Have a System to Build?
            </h2>
            <p className="build-cta__text">
              Bring the requirement, constraints, and workflow. The next step is turning them into a practical system.
            </p>
            <div className="build-cta__actions">
              <Link to="/start-a-project" className="build-action-btn build-action-btn--primary">
                Start a Project →
              </Link>
              <Link to="/contact" className="build-action-btn build-action-btn--secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
