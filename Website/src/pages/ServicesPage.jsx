import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../services/api';
import './ServicesPage.css';

const FALLBACK_SERVICES = [
  {
    num: '01',
    title: 'Web Application Development',
    description:
      'End-to-end web applications built around real business workflows, from frontend interfaces to backend logic and databases.',
    tags: ['Python', 'Flask', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    num: '02',
    title: 'Backend Development',
    description:
      'Structured backend systems for applications that need reliable business logic, APIs, database operations, and validation.',
    tags: ['Python', 'Flask', 'REST APIs', 'SQL', 'Database Design'],
  },
  {
    num: '03',
    title: 'Database & SQL Solutions',
    description:
      'Design and implementation of structured database systems for applications that depend on consistent and reliable data.',
    tags: ['MySQL', 'SQLite', 'SQL', 'Database Design', 'CRUD Operations'],
  },
  {
    num: '04',
    title: 'Project Development',
    description:
      'Practical software projects developed from requirements to working implementation, with clear structure and documented functionality.',
    tags: ['Requirement Analysis', 'System Design', 'Implementation', 'Testing', 'Documentation'],
  },
];

/**
 * Services Page Component
 * Pragmatic software development services, delivery process, and client focus.
 */
export default function ServicesPage() {
  const [services, setServices] = useState(FALLBACK_SERVICES);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch published services from backend
  useEffect(() => {
    let isMounted = true;
    servicesApi
      .getAll()
      .then((res) => {
        if (isMounted && res && Array.isArray(res.services) && res.services.length > 0) {
          const formatted = res.services.map((s, idx) => ({
            num: String(idx + 1).padStart(2, '0'),
            title: s.title,
            description: s.description || s.short_description,
            tags: Array.isArray(s.technologies) ? s.technologies : s.tags || [],
          }));
          setServices(formatted);
        }
      })
      .catch(() => {
        // Safe fallback preserved
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const processSteps = [
    {
      num: '01',
      title: 'Understand',
      desc: 'Understand the requirement, users, and actual problem.',
    },
    {
      num: '02',
      title: 'Plan',
      desc: 'Break the problem into features, workflows, data, and technical components.',
    },
    {
      num: '03',
      title: 'Build',
      desc: 'Implement the application with clean frontend, backend, and database structure.',
    },
    {
      num: '04',
      title: 'Test & Refine',
      desc: 'Validate functionality, fix issues, and improve the implementation.',
    },
  ];

  const deliverables = [
    'Practical solution',
    'Responsive interface',
    'Backend implementation',
    'Database integration',
    'Validated workflows',
    'Clean project structure',
    'Basic documentation',
  ];

  const targetAudiences = [
    {
      title: 'Students & Developers',
      desc: 'Academic and portfolio projects that need a proper end-to-end implementation.',
    },
    {
      title: 'Small Businesses',
      desc: 'Simple internal tools and web applications for real operational needs.',
    },
    {
      title: 'Project Ideas',
      desc: 'Turning a practical idea into a working software prototype.',
    },
  ];

  return (
    <div className="services-page">
      <div className="services-container">
        {/* 1. Page Intro */}
        <header className="services__header">
          <div className="services__eyebrow badge badge--accent font-mono">
            <span className="services__eyebrow-dot" aria-hidden="true" />
            <span>WHAT I CAN BUILD</span>
          </div>

          <h1 className="services__title">
            Software That Solves Real Problems.
          </h1>

          <p className="services__lead">
            I build practical web applications and backend systems with a focus on clean logic, reliable data, and simple user experiences.
          </p>
        </header>

        <div className="services__body">
          {/* 2. Services Grid */}
          <section className="services__section" aria-labelledby="heading-services">
            <div className="services__section-head">
              <span className="services__accent-bar" aria-hidden="true" />
              <h2 id="heading-services" className="services__section-title">
                Core Offerings
              </h2>
            </div>

            <div className="services__grid" role="region" aria-label="Software Services">
              {services.map((service) => (
                <article key={service.title} className="service-card">
                  <div className="service-card__top">
                    <span className="service-card__num font-mono">{service.num}</span>
                    <h3 className="service-card__title">{service.title}</h3>
                  </div>

                  <p className="service-card__desc">{service.description}</p>

                  <div className="service-card__tags">
                    {service.tags.map((tag) => (
                      <span key={tag} className="service-card__tag font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* 3. How I Work */}
          <section className="services__section" aria-labelledby="heading-process">
            <div className="services__section-head">
              <span className="services__accent-bar" aria-hidden="true" />
              <h2 id="heading-process" className="services__section-title">
                How I Work
              </h2>
            </div>

            <div className="process-flow" role="region" aria-label="4-Step Working Process">
              {processSteps.map((step) => (
                <div key={step.num} className="process-card">
                  <span className="process-card__num font-mono">{step.num}</span>
                  <h3 className="process-card__title">{step.title}</h3>
                  <p className="process-card__desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. What You Get */}
          <section className="services__section" aria-labelledby="heading-deliverables">
            <div className="services__section-head">
              <span className="services__accent-bar" aria-hidden="true" />
              <h2 id="heading-deliverables" className="services__section-title">
                What You Get
              </h2>
            </div>

            <div className="services__card services__card--deliverables">
              <ul className="services__checklist" aria-label="Project Deliverables">
                {deliverables.map((item) => (
                  <li key={item} className="services__checklist-item">
                    <span className="services__check-icon" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 5. Who This Is For */}
          <section className="services__section" aria-labelledby="heading-audience">
            <div className="services__section-head">
              <span className="services__accent-bar" aria-hidden="true" />
              <h2 id="heading-audience" className="services__section-title">
                Who I Build For
              </h2>
            </div>

            <div className="audience-grid" role="region" aria-label="Target Client Groups">
              {targetAudiences.map((aud) => (
                <div key={aud.title} className="services__card audience-card">
                  <h3 className="audience-card__title">{aud.title}</h3>
                  <p className="audience-card__desc">{aud.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. CTA */}
          <section className="services__section services__section--cta" aria-labelledby="heading-cta">
            <div className="services__cta-card">
              <h2 id="heading-cta" className="services__cta-title">
                Have a Problem to Solve?
              </h2>

              <p className="services__cta-desc">
                Tell me what you are trying to build. We can break the requirement down and turn it into a practical software solution.
              </p>

              <div className="services__cta-actions">
                <Link to="/contact" className="services__btn services__btn--primary">
                  Start a Project →
                </Link>
                <Link to="/work" className="services__btn services__btn--secondary">
                  View My Work →
                </Link>
              </div>

              <div className="services__assistant-hint">
                <span>Not sure how to scope your idea?</span>{' '}
                <Link to="/project-assistant" className="services__assistant-link">
                  Use the Project Brief Assistant →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
