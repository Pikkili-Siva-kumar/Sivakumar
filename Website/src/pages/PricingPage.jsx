import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PricingPage.css';

/**
 * Pricing Page Component
 * Informational pricing model, scope determinants, consultation process, and project initiation.
 */
export default function PricingPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pricingCards = [
    {
      id: 'project-development',
      title: 'Project Development',
      description:
        'End-to-end development of practical web applications and academic or personal projects.',
      includes: [
        'Requirement understanding',
        'Application development',
        'Database integration',
        'Testing and refinement',
      ],
      pricingLabel: 'Discuss the scope',
      ctaText: 'Start a Project →',
    },
    {
      id: 'web-application',
      title: 'Web Application',
      description:
        'Custom web applications designed around a specific workflow, business need, or use case.',
      includes: [
        'Frontend development',
        'Backend development',
        'Database integration',
        'Responsive design',
      ],
      pricingLabel: 'Custom quote',
      ctaText: 'Discuss Your Project →',
    },
    {
      id: 'backend-api',
      title: 'Backend & API',
      description:
        'Backend systems, REST APIs, business logic, and database-connected functionality.',
      includes: [
        'Python / Flask',
        'REST API development',
        'Database integration',
        'Validation and testing',
      ],
      pricingLabel: 'Custom quote',
      ctaText: 'Discuss Your Project →',
    },
    {
      id: 'database-sql',
      title: 'Database & SQL',
      description:
        'Database design and SQL solutions for applications, projects, and data workflows.',
      includes: [
        'Database design',
        'SQL queries',
        'MySQL / SQLite',
        'Data validation',
      ],
      pricingLabel: 'Custom quote',
      ctaText: 'Discuss Your Project →',
    },
  ];

  const priceFactors = [
    {
      num: '01',
      title: 'Scope',
      desc: 'The number of features and overall functionality.',
    },
    {
      num: '02',
      title: 'Complexity',
      desc: 'Backend logic, integrations, authentication, databases, and other technical requirements.',
    },
    {
      num: '03',
      title: 'Timeline',
      desc: 'Shorter timelines may require a different development approach.',
    },
    {
      num: '04',
      title: 'Requirements',
      desc: 'Specific technologies, workflows, testing, and deployment needs.',
    },
  ];

  const processSteps = [
    {
      num: '01',
      title: 'Understand',
      desc: 'Understand the idea and requirements.',
    },
    {
      num: '02',
      title: 'Scope',
      desc: 'Define the features and technical scope.',
    },
    {
      num: '03',
      title: 'Estimate',
      desc: 'Discuss the expected effort and timeline.',
    },
    {
      num: '04',
      title: 'Build',
      desc: 'Start development once the scope is agreed.',
    },
  ];

  return (
    <div className="pricing-page">
      <div className="pricing-container">
        {/* HERO SECTION */}
        <header className="pricing__header">
          <div className="pricing__eyebrow badge badge--accent font-mono">
            <span className="pricing__eyebrow-dot" aria-hidden="true" />
            <span>PRICING</span>
          </div>

          <h1 className="pricing__title">Choose the right way to build.</h1>

          <p className="pricing__lead">
            Every project is different. Pricing depends on the type of work, scope, features, timeline, and technical requirements.
          </p>

          <div className="pricing__note-card">
            <span className="pricing__note-icon" aria-hidden="true">ℹ</span>
            <p className="pricing__note-text">
              Final pricing is discussed after understanding the project requirements.
            </p>
          </div>
        </header>

        <div className="pricing__body">
          {/* SECTION 1 — WAYS I CAN HELP */}
          <section className="pricing__section" aria-labelledby="heading-ways-to-help">
            <div className="pricing__section-head">
              <span className="pricing__accent-bar" aria-hidden="true" />
              <h2 id="heading-ways-to-help" className="pricing__section-title">
                Ways I Can Help
              </h2>
            </div>

            <div className="pricing-grid" role="region" aria-label="Pricing and Service Models">
              {pricingCards.map((card) => (
                <article key={card.id} className="pricing-card">
                  <div className="pricing-card__header">
                    <h3 className="pricing-card__title">{card.title}</h3>
                    <p className="pricing-card__desc">{card.description}</p>
                  </div>

                  <div className="pricing-card__includes">
                    <span className="pricing-card__includes-label font-mono">Includes:</span>
                    <ul className="pricing-card__checklist" aria-label={`Included with ${card.title}`}>
                      {card.includes.map((item) => (
                        <li key={item} className="pricing-card__check-item">
                          <span className="pricing-card__check-icon" aria-hidden="true">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pricing-card__footer">
                    <div className="pricing-card__pricing-label font-mono">
                      <span className="pricing-card__pricing-dot" aria-hidden="true" />
                      <span>{card.pricingLabel}</span>
                    </div>

                    <Link to="/start-a-project" className="pricing__btn pricing__btn--card">
                      {card.ctaText}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 2 — WHAT AFFECTS THE PRICE */}
          <section className="pricing__section" aria-labelledby="heading-price-factors">
            <div className="pricing__section-head">
              <span className="pricing__accent-bar" aria-hidden="true" />
              <h2 id="heading-price-factors" className="pricing__section-title">
                What determines the project cost?
              </h2>
            </div>

            <div className="factors-grid" role="region" aria-label="Key cost determinants">
              {priceFactors.map((factor) => (
                <div key={factor.num} className="factor-card">
                  <div className="factor-card__header">
                    <span className="factor-card__num font-mono">{factor.num}</span>
                    <h3 className="factor-card__title">{factor.title}</h3>
                  </div>
                  <p className="factor-card__desc">{factor.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3 — SIMPLE PROCESS */}
          <section className="pricing__section" aria-labelledby="heading-pricing-process">
            <div className="pricing__section-head">
              <span className="pricing__accent-bar" aria-hidden="true" />
              <h2 id="heading-pricing-process" className="pricing__section-title">
                How pricing works
              </h2>
            </div>

            <div className="pricing-process-grid" role="region" aria-label="4-Step Pricing and Scope Process">
              {processSteps.map((step) => (
                <div key={step.num} className="pricing-process-card">
                  <span className="pricing-process-card__num font-mono">{step.num}</span>
                  <h3 className="pricing-process-card__title">{step.title}</h3>
                  <p className="pricing-process-card__desc">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4 — FINAL CTA */}
          <section className="pricing__section pricing__section--cta" aria-labelledby="heading-pricing-cta">
            <div className="pricing__cta-card">
              <h2 id="heading-pricing-cta" className="pricing__cta-title">
                Have a project in mind?
              </h2>

              <p className="pricing__cta-desc">
                Tell me what you want to build and I’ll help define the scope.
              </p>

              <div className="pricing__cta-actions">
                <Link to="/start-a-project" className="pricing__btn pricing__btn--primary">
                  Start a Project →
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
