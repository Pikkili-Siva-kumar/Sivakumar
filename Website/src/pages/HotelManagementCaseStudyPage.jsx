import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import { trackEvent } from '../utils/analytics';
import './HotelManagementCaseStudyPage.css';

/**
 * Technical Case Study: Luxury Hotel Management System
 * Full-stack engineering breakdown of user workflows, availability logic,
 * database modeling, and administrative approval processing.
 */
export default function HotelManagementCaseStudyPage() {
  // Scroll to top and record analytics event on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent({
      eventType: 'project_view',
      path: '/work/luxury-hotel-management',
      metadata: { slug: 'luxury-hotel-management' },
    });
  }, []);

  const flowSteps = [
    { num: '01', title: 'USER LOGIN', desc: 'Authentication access' },
    { num: '02', title: 'SELECT ROOM', desc: 'Browse room inventory' },
    { num: '03', title: 'CHECK AVAILABILITY', desc: 'Date & status check' },
    { num: '04', title: 'SUBMIT BOOKING', desc: 'Reserve request payload' },
    { num: '05', title: 'DATABASE', desc: 'Record insertion' },
    { num: '06', title: 'ADMIN REVIEW', desc: 'Staff review queue' },
    { num: '07', title: 'BOOKING APPROVAL', desc: 'Confirmed booking state' },
  ];

  const coreFeatures = [
    {
      title: 'User Authentication',
      detail: 'Structured login flow allowing registered users to access booking services securely.',
    },
    {
      title: 'Room Selection',
      detail: 'Clean catalog presentation allowing users to browse and select from active room inventories.',
    },
    {
      title: 'Availability Checking',
      detail: 'Backend query logic verifying that a requested room is vacant and eligible for reservation.',
    },
    {
      title: 'Booking Management',
      detail: 'Processes user booking submissions, generating traceable reservations stored in database tables.',
    },
    {
      title: 'Admin Approval',
      detail: 'Administrative management workflow where operations staff review pending requests and approve bookings.',
    },
    {
      title: 'Database Management',
      detail: 'Maintains referential consistency and lifecycle states across users, room specifications, and booking logs.',
    },
  ];

  const architectureLayers = [
    {
      layer: 'FRONTEND',
      tech: 'HTML • CSS • JavaScript',
      desc: 'Interactive user interface, room views, booking forms, and client validation',
    },
    {
      layer: 'BACKEND',
      tech: 'Python • Flask',
      desc: 'Application routing, authentication handling, session management, and business logic',
    },
    {
      layer: 'DATABASE',
      tech: 'MySQL',
      desc: 'Relational data persistence, schema constraints, and transactional consistency',
    },
    {
      layer: 'APPLICATION DATA',
      tech: 'Users • Rooms • Bookings',
      desc: 'Core relational entities maintaining user profiles, inventory availability, and order status',
    },
  ];

  const workflowSteps = [
    { num: '01', title: 'User logs in', desc: 'User authenticates into the web application to initiate a booking session.' },
    { num: '02', title: 'User selects a room', desc: 'Browses available accommodations and chooses a desired room category.' },
    { num: '03', title: 'System checks availability', desc: 'Backend queries the database to confirm the room is unreserved for the required dates.' },
    { num: '04', title: 'User submits booking', desc: 'Client posts reservation details including guest count and schedule.' },
    { num: '05', title: 'Booking information is stored', desc: 'Backend writes a new pending reservation record into MySQL tables.' },
    { num: '06', title: 'Admin reviews the request', desc: 'Management accesses the admin review queue to evaluate reservation parameters.' },
    { num: '07', title: 'Admin approves the booking', desc: 'System updates the booking record to approved status, locking room availability.' },
  ];

  const considerations = [
    {
      title: 'Validating Room Availability',
      detail:
        'Verifying room state against existing reservations prior to insertion to prevent conflicting bookings and double-allocation.',
    },
    {
      title: 'Maintaining Consistent Booking Data',
      detail:
        'Ensuring that every booking state transition—from pending to approved—is accurately mirrored across relational database records without orphaned states.',
    },
    {
      title: 'Separating User and Admin Workflows',
      detail:
        'Isolating general customer booking submission views from administrative moderation queues to enforce clear separation of operational duties.',
    },
    {
      title: 'Handling Database Operations',
      detail:
        'Structuring clean SQL queries for room retrieval, user lookups, and booking status updates while avoiding query bottlenecks during peak lookups.',
    },
    {
      title: 'Keeping the Booking Flow Structured',
      detail:
        'Guiding users through a transparent, linear progression from login and room selection to submission and administrative confirmation.',
    },
  ];

  const deliverables = [
    'User login flow',
    'Room selection',
    'Room availability checking',
    'Booking workflow',
    'Database integration',
    'Admin approval workflow',
    'End-to-end web application structure',
  ];

  return (
    <article className="case-study-page">
      <Container size="default">
        {/* 1. Back Navigation */}
        <nav className="case-study__back-nav" aria-label="Breadcrumb">
          <Link to="/work" className="case-study__back-link">
            <span aria-hidden="true">←</span>
            <span>Back to Selected Work</span>
          </Link>
        </nav>

        {/* 2. Project Header */}
        <header className="case-study__header">
          <div className="case-study__badge-row">
            <span className="badge badge--accent font-mono">CASE STUDY • 02</span>
            <span className="case-study__category font-mono">
              Backend • Web Application • Database
            </span>
          </div>

          <h1 className="case-study__title">
            Luxury Hotel Management System
          </h1>

          <p className="case-study__lead">
            An end-to-end hotel management application designed to manage users, room selection, availability, and booking workflows through a structured backend and database system.
          </p>

          <div className="case-study__tags-row" aria-label="Technology Stack Tags">
            {['Python', 'Flask', 'MySQL', 'HTML', 'CSS', 'JavaScript'].map((tech) => (
              <span key={tech} className="case-study__tag">
                {tech}
              </span>
            ))}
          </div>
        </header>

        {/* Content Body */}
        <div className="case-study__body">
          {/* 3. Project Overview */}
          <section className="case-study__section" aria-labelledby="heading-overview">
            <h2 id="heading-overview" className="case-study__section-heading">
              Overview
            </h2>
            <div className="case-study__text-block">
              <p>
                The Luxury Hotel Management System is a practical full-stack web application developed to coordinate hotel hospitality operations. It manages the core interaction loop between customer room reservations and administrative operations without unnecessary complexity.
              </p>
              <p>
                Within the application, authenticated users can log in, view and filter available room inventories, verify date-specific availability, and submit structured reservation requests. On the backend, a Python Flask service coordinates with a MySQL database to record transactions. An administrative review workflow allows operations staff to inspect incoming booking requests and formally approve them.
              </p>
            </div>
          </section>

          {/* 4. The Problem */}
          <section className="case-study__section" aria-labelledby="heading-problem">
            <h2 id="heading-problem" className="case-study__section-heading">
              The Problem
            </h2>
            <div className="case-study__text-block">
              <p>
                Hotel reservation operations require constant, multi-party synchronization across shifting operational constraints:
              </p>
              <div className="case-study__card case-study__card--problem">
                <p>
                  <strong>Multi-Entity Coordination:</strong> Managing reservations requires real-time coordination between guest profiles, room categories, pricing tiers, schedule calendars, and staff approval checkpoints.
                </p>
                <p style={{ marginTop: 'var(--space-3)' }}>
                  <strong>Availability Conflicts:</strong> Without strict backend validation, overlapping reservation submissions can result in double-booking rooms and inconsistent inventory counts.
                </p>
                <p style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
                  <strong>The Core Need:</strong> A structured software system where room availability, guest requests, and administrative approvals are tracked reliably through a disciplined database architecture.
                </p>
              </div>
            </div>
          </section>

          {/* 5. System Flow (How It Works) */}
          <section className="case-study__section" aria-labelledby="heading-flow">
            <h2 id="heading-flow" className="case-study__section-heading">
              How It Works
            </h2>
            <p className="case-study__section-intro">
              The end-to-end reservation cycle follows a clear, multi-stage pipeline:
            </p>

            <div className="case-study__flow" role="region" aria-label="System Workflow Flowchart">
              {flowSteps.map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="case-study__flow-node">
                    <span className="case-study__flow-num font-mono">{step.num}</span>
                    <span className="case-study__flow-title font-mono">{step.title}</span>
                    <span className="case-study__flow-desc">{step.desc}</span>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <div className="case-study__flow-arrow" aria-hidden="true">
                      <span className="case-study__flow-arrow-desktop">→</span>
                      <span className="case-study__flow-arrow-mobile">↓</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* 6. Core Features */}
          <section className="case-study__section" aria-labelledby="heading-features">
            <h2 id="heading-features" className="case-study__section-heading">
              Core Features
            </h2>
            <div className="case-study__impl-grid">
              {coreFeatures.map((feat) => (
                <div key={feat.title} className="case-study__card">
                  <h3 className="case-study__card-title">{feat.title}</h3>
                  <p className="case-study__card-text">{feat.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Technical Architecture */}
          <section className="case-study__section" aria-labelledby="heading-arch">
            <h2 id="heading-arch" className="case-study__section-heading">
              Technical Architecture
            </h2>
            <p className="case-study__section-intro">
              Structured multi-tier architecture connecting the presentation layer to persistent database storage:
            </p>

            <div className="hotel-arch" role="region" aria-label="Technical Architecture Stack">
              {architectureLayers.map((layer, idx) => (
                <React.Fragment key={layer.layer}>
                  <div className="hotel-arch__card">
                    <div className="hotel-arch__header">
                      <span className="hotel-arch__label font-mono">{layer.layer}</span>
                      <span className="hotel-arch__tech font-mono">{layer.tech}</span>
                    </div>
                    <p className="hotel-arch__desc">{layer.desc}</p>
                  </div>
                  {idx < architectureLayers.length - 1 && (
                    <div className="hotel-arch__connector" aria-hidden="true">
                      <span>↓</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* 8. Database Design */}
          <section className="case-study__section" aria-labelledby="heading-db">
            <h2 id="heading-db" className="case-study__section-heading">
              Database Design
            </h2>
            <div className="case-study__text-block">
              <p>
                The persistence model is organized into core relational entities that govern application operations:
              </p>
            </div>

            <div className="hotel-db__grid">
              <div className="case-study__card hotel-db__card">
                <span className="font-mono text-xs text-accent">ENTITY</span>
                <h3 className="case-study__card-title" style={{ marginTop: 'var(--space-1)' }}>Users</h3>
                <p className="case-study__card-text">
                  Maintains client account records, credentials, and contact identities required to establish authenticated booking sessions.
                </p>
              </div>

              <div className="case-study__card hotel-db__card">
                <span className="font-mono text-xs text-accent">ENTITY</span>
                <h3 className="case-study__card-title" style={{ marginTop: 'var(--space-1)' }}>Rooms</h3>
                <p className="case-study__card-text">
                  Tracks physical inventory specifications, room types, pricing categories, and active operational status.
                </p>
              </div>

              <div className="case-study__card hotel-db__card">
                <span className="font-mono text-xs text-accent">ENTITY</span>
                <h3 className="case-study__card-title" style={{ marginTop: 'var(--space-1)' }}>Bookings</h3>
                <p className="case-study__card-text">
                  Stores reservation instances, linking specific user records to selected room assets with schedule windows and status flags.
                </p>
              </div>
            </div>

            {/* Conceptual Relationship Map */}
            <div className="hotel-db__rel-card">
              <span className="font-mono text-xs text-muted" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
                CONCEPTUAL RELATIONSHIP MODEL
              </span>
              <div className="hotel-db__rel-flow">
                <div className="hotel-db__rel-node">
                  <span className="font-mono font-semibold text-primary">User</span>
                </div>
                <div className="hotel-db__rel-edge">
                  <span className="font-mono text-xs text-muted">creates →</span>
                </div>
                <div className="hotel-db__rel-node hotel-db__rel-node--highlight">
                  <span className="font-mono font-semibold text-primary">Booking</span>
                </div>
                <div className="hotel-db__rel-edge">
                  <span className="font-mono text-xs text-muted">references →</span>
                </div>
                <div className="hotel-db__rel-node">
                  <span className="font-mono font-semibold text-primary">Room</span>
                </div>
              </div>
            </div>
          </section>

          {/* 9. Booking Workflow */}
          <section className="case-study__section" aria-labelledby="heading-workflow">
            <h2 id="heading-workflow" className="case-study__section-heading">
              Booking Workflow
            </h2>
            <div className="hotel-timeline" role="list" aria-label="Step-by-step booking workflow">
              {workflowSteps.map((step) => (
                <div key={step.num} className="hotel-timeline__item" role="listitem">
                  <div className="hotel-timeline__badge font-mono">{step.num}</div>
                  <div className="hotel-timeline__content">
                    <h3 className="hotel-timeline__title">{step.title}</h3>
                    <p className="hotel-timeline__desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10. Engineering Considerations */}
          <section className="case-study__section" aria-labelledby="heading-considerations">
            <h2 id="heading-considerations" className="case-study__section-heading">
              Engineering Considerations
            </h2>
            <div className="case-study__considerations-grid">
              {considerations.map((item) => (
                <div key={item.title} className="case-study__card">
                  <h3 className="case-study__card-title">{item.title}</h3>
                  <p className="case-study__card-text">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 11. What I Built */}
          <section className="case-study__section" aria-labelledby="heading-deliverables">
            <h2 id="heading-deliverables" className="case-study__section-heading">
              What I Built
            </h2>
            <div className="case-study__card">
              <ul className="case-study__check-list">
                {deliverables.map((item) => (
                  <li key={item} className="case-study__check-item">
                    <span className="case-study__check-mark" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 12. Project Summary */}
          <section className="case-study__section" aria-labelledby="heading-summary">
            <h2 id="heading-summary" className="case-study__section-heading">
              Project Summary
            </h2>
            <div className="case-study__summary-card">
              <p className="case-study__summary-text">
                Built as a practical full-stack application to understand how user workflows, backend logic, database operations, and administrative processes come together in a real-world booking system.
              </p>
            </div>
          </section>

          {/* 13. Bottom Navigation */}
          <footer className="case-study__nav-footer" aria-label="Case Study Navigation">
            <Link
              to="/work/federated-learning-6g"
              className="case-study__nav-btn case-study__nav-btn--prev"
            >
              ← Previous Project
            </Link>

            <Link
              to="/playground?project=luxury-hotel-management"
              className="case-study__nav-btn case-study__nav-btn--interactive"
            >
              Try the Interactive Demo →
            </Link>

            <Link
              to="/behind-the-build?project=luxury-hotel-management"
              className="case-study__nav-btn case-study__nav-btn--build"
            >
              Explore Behind the Build →
            </Link>

            <Link
              to="/work"
              className="case-study__nav-btn case-study__nav-btn--next"
            >
              Back to Selected Work
            </Link>
          </footer>
        </div>
      </Container>
    </article>
  );
}
