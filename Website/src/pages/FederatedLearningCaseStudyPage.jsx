import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import { trackEvent } from '../utils/analytics';
import './FederatedLearningCaseStudyPage.css';

/**
 * Technical Case Study: Federated Learning for 6G Networks
 * Rigorous engineering breakdown of decentralized training, aggregation, and validation.
 */
export default function FederatedLearningCaseStudyPage() {
  // Scroll to top and record analytics event on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent({
      eventType: 'project_view',
      path: '/work/federated-learning-6g',
      metadata: { slug: 'federated-learning-6g' },
    });
  }, []);

  const flowSteps = [
    { num: '01', title: 'DATASET', desc: 'Node data sources' },
    { num: '02', title: 'VALIDATION', desc: 'Schema & boundary checks' },
    { num: '03', title: 'LOCAL MODEL TRAINING', desc: 'Edge node computation' },
    { num: '04', title: 'MODEL UPDATES', desc: 'Parameter extraction' },
    { num: '05', title: 'GLOBAL AGGREGATION', desc: 'Coordinator synthesis' },
    { num: '06', title: 'PREDICTION', desc: 'Real-time inference' },
  ];

  const techStack = [
    { name: 'Python', role: 'Core language for algorithm execution and ML pipeline' },
    { name: 'Flask', role: 'Backend API service, upload routing, and inference endpoints' },
    { name: 'MySQL', role: 'Database storage for session states, metadata, and logs' },
    { name: 'Scikit-learn', role: 'Classical ML algorithms (RF, MLP), preprocessing & metrics' },
    { name: 'XGBoost', role: 'Gradient-boosted decision trees for structured prediction' },
  ];

  const deliverables = [
    'Dataset upload and validation',
    'Model selection',
    'Local model training',
    'Global model aggregation',
    'Real-time prediction',
    'Testing across multiple models',
  ];

  const considerations = [
    {
      title: 'Input Validation',
      detail:
        'Ensuring uploaded datasets conform strictly to required tabular feature formats, rejecting malformed inputs, missing columns, and out-of-boundary values before passing arrays to training routines.',
    },
    {
      title: 'Maintaining Data Integrity',
      detail:
        'Tracking training runs and session states within MySQL without race conditions or corrupted model identifiers during consecutive training passes.',
    },
    {
      title: 'Model Selection',
      detail:
        'Accommodating varying algorithmic structures—from decision tree ensembles (Random Forest, XGBoost) to neural networks (CNN, MLP)—within a modular interface.',
    },
    {
      title: 'Coordinating Local & Global Training',
      detail:
        'Managing the separation between local training stages and the central global aggregation stage to ensure weights are synchronized properly without leaking client datasets.',
    },
    {
      title: 'Handling Prediction Flow',
      detail:
        'Structuring input feature vectors to match global model parameters and returning real-time classification responses reliably.',
    },
  ];

  return (
    <article className="case-study-page">
      <Container size="default">
        {/* 1. Back Link */}
        <nav className="case-study__back-nav" aria-label="Breadcrumb">
          <Link to="/work" className="case-study__back-link">
            <span aria-hidden="true">←</span>
            <span>Back to Selected Work</span>
          </Link>
        </nav>

        {/* 2. Project Header */}
        <header className="case-study__header">
          <div className="case-study__badge-row">
            <span className="badge badge--accent font-mono">CASE STUDY • 01</span>
            <span className="case-study__category font-mono">
              Machine Learning • Backend • 6G
            </span>
          </div>

          <h1 className="case-study__title">
            Federated Learning for 6G Networks
          </h1>

          <p className="case-study__lead">
            Developed a federated learning-based system for decentralized model training without sharing raw data, with the goal of improving privacy and reducing latency.
          </p>

          <div className="case-study__tags-row" aria-label="Technology Stack Tags">
            {['Python', 'Flask', 'MySQL', 'Scikit-learn', 'XGBoost'].map((tech) => (
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
                In emerging 6G network architectures, massive volumes of data are generated at edge nodes, including mobile devices, edge routers, and local access points. Traditional machine-learning pipelines require centralizing this data onto a single server for training, which introduces high latency overhead and exposes private raw information.
              </p>
              <p>
                This project implements a decentralized federated learning workflow where local models are trained independently on distributed data sources. Instead of transferring sensitive raw records, local updates are extracted and aggregated by a central coordinator into a unified global model. The resulting global model is then deployed for real-time inference, balancing data privacy with effective predictive capability.
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
                Centralized machine-learning architectures present significant bottlenecks in distributed network environments:
              </p>
              <div className="case-study__card case-study__card--problem">
                <p>
                  <strong>Data Privacy & Security:</strong> Transmitting raw datasets from edge nodes to a remote data center exposes user behavior, network topology, and sensitive application payloads to network interception and unauthorized access.
                </p>
                <p style={{ marginTop: 'var(--space-3)' }}>
                  <strong>Latency & Bandwidth Bottlenecks:</strong> Continuous transmission of raw data consumes substantial network bandwidth and introduces latency that is unacceptable for real-time 6G communication requirements.
                </p>
                <p style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
                  <strong>The Core Need:</strong> A software system that allows collaborative machine-learning training across distributed partitions without requiring direct sharing of raw records.
                </p>
              </div>
            </div>
          </section>

          {/* 5. The Approach (How It Works) */}
          <section className="case-study__section" aria-labelledby="heading-approach">
            <h2 id="heading-approach" className="case-study__section-heading">
              How It Works
            </h2>
            <p className="case-study__section-intro">
              The system coordinates decentralized model development through a disciplined multi-stage workflow:
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

          {/* 6. Key Implementation */}
          <section className="case-study__section" aria-labelledby="heading-implementation">
            <h2 id="heading-implementation" className="case-study__section-heading">
              Implementation
            </h2>
            <div className="case-study__impl-grid">
              <div className="case-study__card">
                <h3 className="case-study__card-title">Dataset Upload & Validation</h3>
                <p className="case-study__card-text">
                  Constructed Flask API endpoints to ingest client data files. Implemented structured validation checks to verify column schema integrity, data types, missing value policies, and numeric feature boundaries before ingestion into model memory.
                </p>
              </div>

              <div className="case-study__card">
                <h3 className="case-study__card-title">Model Selection</h3>
                <p className="case-study__card-text">
                  Integrated support for diverse algorithmic families including Random Forest (RF), Convolutional Neural Networks (CNN), Multi-Layer Perceptrons (MLP), and XGBoost, enabling comparative evaluation of different learning architectures.
                </p>
              </div>

              <div className="case-study__card">
                <h3 className="case-study__card-title">Local Training</h3>
                <p className="case-study__card-text">
                  Isolated training routines on local partitions so edge computations proceed without network-wide raw data exchanges. Each local model updates its parameters exclusively against its local dataset.
                </p>
              </div>

              <div className="case-study__card">
                <h3 className="case-study__card-title">Global Aggregation</h3>
                <p className="case-study__card-text">
                  Engineered the aggregation module where local model updates are gathered by the coordinator and mathematically combined into a shared global model representation without accessing raw records.
                </p>
              </div>

              <div className="case-study__card" style={{ gridColumn: '1 / -1' }}>
                <h3 className="case-study__card-title">Real-Time Prediction</h3>
                <p className="case-study__card-text">
                  Exported the converged global model for inference serving. Deployed lightweight prediction routes capable of receiving unseen input vectors, validating feature shape, and returning classification predictions.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Technology Stack */}
          <section className="case-study__section" aria-labelledby="heading-tech">
            <h2 id="heading-tech" className="case-study__section-heading">
              Technology Stack
            </h2>
            <div className="case-study__tech-grid">
              {techStack.map((tech) => (
                <div key={tech.name} className="case-study__tech-item">
                  <span className="case-study__tech-name font-mono">{tech.name}</span>
                  <span className="case-study__tech-role">{tech.role}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Testing & Validation */}
          <section className="case-study__section" aria-labelledby="heading-testing">
            <h2 id="heading-testing" className="case-study__section-heading">
              Testing & Validation
            </h2>
            <div className="case-study__card">
              <ul className="case-study__check-list" aria-label="Testing verification items">
                <li className="case-study__check-item">
                  <span className="case-study__check-mark" aria-hidden="true">✓</span>
                  <div>
                    <strong>Upload & Schema Validation:</strong> Tested input datasets with missing headers, non-numeric values, and abnormal ranges to ensure graceful error handling.
                  </div>
                </li>
                <li className="case-study__check-item">
                  <span className="case-study__check-mark" aria-hidden="true">✓</span>
                  <div>
                    <strong>Cross-Model Convergence:</strong> Verified that Random Forest, CNN, MLP, and XGBoost models completed local training passes across sample data without runtime exceptions.
                  </div>
                </li>
                <li className="case-study__check-item">
                  <span className="case-study__check-mark" aria-hidden="true">✓</span>
                  <div>
                    <strong>Local & Global Pipeline Flow:</strong> Validated the complete lifecycle: dataset ingestion → local model parameter computation → global aggregation → updated model generation.
                  </div>
                </li>
                <li className="case-study__check-item">
                  <span className="case-study__check-mark" aria-hidden="true">✓</span>
                  <div>
                    <strong>Inference Integrity:</strong> Tested real-time prediction endpoints with test inputs to confirm expected response format and output consistency.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* 9. Engineering Considerations */}
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

          {/* 10. What I Built */}
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

          {/* 11. Project Summary */}
          <section className="case-study__section" aria-label="Project Summary">
            <div className="case-study__summary-card">
              <p className="case-study__summary-text">
                Built as an end-to-end learning project combining machine learning, backend development, database concepts, and 6G networking.
              </p>
            </div>
          </section>

          {/* 12. Bottom Navigation */}
          <footer className="case-study__nav-footer" aria-label="Case Study Navigation">
            <Link to="/work" className="case-study__nav-btn case-study__nav-btn--prev">
              ← Selected Work
            </Link>

            <Link
              to="/playground?project=federated-learning-6g"
              className="case-study__nav-btn case-study__nav-btn--interactive"
            >
              Try the Interactive Demo →
            </Link>

            <Link
              to="/behind-the-build?project=federated-learning-6g"
              className="case-study__nav-btn case-study__nav-btn--build"
            >
              Explore Behind the Build →
            </Link>

            <Link
              to="/work/luxury-hotel-management"
              className="case-study__nav-btn case-study__nav-btn--next"
            >
              Next Project →
            </Link>
          </footer>
        </div>
      </Container>
    </article>
  );
}
