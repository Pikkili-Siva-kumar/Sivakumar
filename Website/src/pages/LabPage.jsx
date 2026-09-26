import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LabPage.css';

/**
 * Lab Page Component
 * Experiments, prototypes, technical exploration, and learning loops.
 */
export default function LabPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const experiments = [
    {
      id: 'exp-01',
      title: 'API Playground',
      status: 'EXPLORING',
      statusType: 'exploring',
      description:
        'Experimenting with REST API structure, request validation, and backend response patterns using Python and Flask.',
      tech: ['Python', 'Flask', 'REST API'],
    },
    {
      id: 'exp-02',
      title: 'Database Patterns',
      status: 'LEARNING',
      statusType: 'learning',
      description:
        'Exploring practical SQL patterns, relational data modeling, joins, aggregation, and database-driven application logic.',
      tech: ['SQL', 'MySQL', 'SQLite'],
    },
    {
      id: 'exp-03',
      title: 'ML Model Playground',
      status: 'EXPERIMENT',
      statusType: 'experiment',
      description:
        'Testing machine-learning workflows and comparing different model approaches through small controlled experiments.',
      tech: ['Python', 'Scikit-learn', 'XGBoost'],
    },
  ];

  const learningSteps = [
    {
      num: '01',
      title: 'LEARN',
      desc: 'Explore concepts, study patterns, and understand the core fundamentals.',
    },
    {
      num: '02',
      title: 'BUILD',
      desc: 'Implement lightweight prototypes and testable code from scratch.',
    },
    {
      num: '03',
      title: 'TEST',
      desc: 'Verify behavior, inspect edge cases, and evaluate how the code handles data.',
    },
    {
      num: '04',
      title: 'REFINE',
      desc: 'Improve structure, modularize logic, and incorporate lessons into future work.',
    },
  ];

  const explorationTopics = [
    {
      title: 'Backend Architecture',
      desc: 'Structuring modular services, request pipelines, and clean application layers.',
    },
    {
      title: 'REST APIs',
      desc: 'Designing predictable endpoints, payload validation, and standard status codes.',
    },
    {
      title: 'Database Design',
      desc: 'Entity relationships, indexing strategies, normalization, and relational integrity.',
    },
    {
      title: 'Machine Learning',
      desc: 'Workflow pipelines, feature preprocessing, model evaluation, and classification.',
    },
    {
      title: 'System Design',
      desc: 'Component boundaries, caching strategies, state handling, and resource efficiency.',
    },
    {
      title: 'Frontend Integration',
      desc: 'Bridging backend API contracts cleanly with responsive user interfaces.',
    },
  ];

  return (
    <div className="lab-page">
      <div className="lab-container">
        {/* Page Intro */}
        <header className="lab__header">
          <div className="lab__eyebrow badge badge--accent font-mono">
            <span className="lab__eyebrow-dot" aria-hidden="true" />
            <span>EXPERIMENTS • PROTOTYPES • LEARNING</span>
          </div>

          <h1 className="lab__title">Inside the Lab.</h1>

          <p className="lab__lead">
            A space for small experiments, technical ideas, and prototypes I build while learning and exploring new ways to solve problems.
          </p>
        </header>

        <div className="lab__body">
          {/* Section 01: Current Experiments */}
          <section className="lab__section" aria-labelledby="heading-experiments">
            <div className="lab__section-head">
              <span className="lab__accent-bar" aria-hidden="true" />
              <h2 id="heading-experiments" className="lab__section-title">
                Current Experiments
              </h2>
            </div>

            <div className="experiments-grid" role="region" aria-label="Current technical experiments">
              {experiments.map((exp) => (
                <article key={exp.id} className="experiment-card">
                  <div className="experiment-card__top">
                    <span className={`experiment-status-badge experiment-status-badge--${exp.statusType} font-mono`}>
                      <span className="experiment-status-badge__dot" aria-hidden="true" />
                      {exp.status}
                    </span>
                  </div>

                  <h3 className="experiment-card__title">{exp.title}</h3>
                  <p className="experiment-card__desc">{exp.description}</p>

                  <div className="experiment-card__tech" aria-label="Technologies used">
                    {exp.tech.map((t) => (
                      <span key={t} className="experiment-card__tag font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Section 02: How I Learn */}
          <section className="lab__section" aria-labelledby="heading-learning">
            <div className="lab__section-head">
              <span className="lab__accent-bar" aria-hidden="true" />
              <h2 id="heading-learning" className="lab__section-title">
                How I Learn
              </h2>
            </div>

            <p className="lab__section-desc">
              I learn best by turning concepts into working implementations, testing what I build, and improving it through iteration.
            </p>

            <div className="learning-loop" role="region" aria-label="Continuous learning 4-step loop">
              {learningSteps.map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="learning-step-card">
                    <div className="learning-step-card__header">
                      <span className="learning-step-card__num font-mono">{step.num}</span>
                      <h3 className="learning-step-card__title">{step.title}</h3>
                    </div>
                    <p className="learning-step-card__desc">{step.desc}</p>
                  </div>
                  {idx < learningSteps.length - 1 && (
                    <div className="learning-loop__arrow" aria-hidden="true">
                      <span className="learning-loop__arrow-horizontal">→</span>
                      <span className="learning-loop__arrow-vertical">↓</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* Section 03: Things I'm Exploring */}
          <section className="lab__section" aria-labelledby="heading-exploring">
            <div className="lab__section-head">
              <span className="lab__accent-bar" aria-hidden="true" />
              <h2 id="heading-exploring" className="lab__section-title">
                Things I'm Exploring
              </h2>
            </div>

            <div className="topics-grid" role="region" aria-label="Technical exploration areas">
              {explorationTopics.map((topic, idx) => (
                <div key={topic.title} className="topic-card">
                  <div className="topic-card__header">
                    <span className="topic-card__index font-mono">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="topic-card__title">{topic.title}</h3>
                  </div>
                  <p className="topic-card__desc">{topic.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 04: From Experiment to Project */}
          <section className="lab__section" aria-labelledby="heading-transition">
            <div className="bridge-block">
              <div className="bridge-block__content">
                <span className="bridge-block__label font-mono">TRANSITION TO PRACTICE</span>
                <h2 id="heading-transition" className="bridge-block__title">
                  From Experiment to Project
                </h2>
                <div className="bridge-block__body">
                  <p>
                    Some experiments stay small. Others become complete projects.
                  </p>
                  <p>
                    The Lab is where ideas are tested before they become part of my larger work.
                  </p>
                </div>
              </div>
              <div className="bridge-block__action">
                <Link to="/playground" className="lab__btn lab__btn--primary">
                  Try the Project Playground →
                </Link>
                <Link to="/digital-products" className="lab__btn lab__btn--secondary">
                  Browse Digital Products →
                </Link>
                <Link to="/work" className="lab__btn lab__btn--secondary">
                  View My Work →
                </Link>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="lab__section lab__section--cta" aria-labelledby="heading-lab-cta">
            <div className="lab__cta-card">
              <h2 id="heading-lab-cta" className="lab__cta-title">
                Have an Idea Worth Testing?
              </h2>

              <p className="lab__cta-desc">
                If you have a practical problem or an idea you'd like to turn into a working prototype, let's talk.
              </p>

              <div className="lab__cta-actions">
                <Link to="/contact" className="lab__btn lab__btn--primary">
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
