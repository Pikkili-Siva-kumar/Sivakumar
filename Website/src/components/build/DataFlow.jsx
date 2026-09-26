import React, { useState, useEffect, useRef } from 'react';

/**
 * Stage classification metadata helper
 */
function getStageMetadata(step, label) {
  const l = (label || '').toLowerCase();

  if (l.includes('input')) {
    return {
      type: 'input',
      phase: 'ENTRY BOUNDARY',
      badgeClass: 'stage-badge--entry',
      io: {
        input: 'User input parameters & requested range',
        operation: 'Payload reception & parameter parsing',
        output: 'Raw request payload dispatched to controller',
      },
    };
  }

  if (l.includes('validate')) {
    return {
      type: 'validate',
      phase: 'INTEGRITY GATE',
      badgeClass: 'stage-badge--validate',
      io: {
        input: 'Raw incoming parameters / schema',
        operation: 'Constraint & boundary logic verification',
        output: 'Sanitized request or rejected exception',
      },
    };
  }

  if (l.includes('check') || l.includes('model') || l.includes('select')) {
    return {
      type: 'query',
      phase: 'QUERY & ENGINE',
      badgeClass: 'stage-badge--query',
      io: {
        input: 'Validated search / model parameters',
        operation: 'Relational overlap test / architecture selection',
        output: 'Availability status / model execution plan',
      },
    };
  }

  if (l.includes('create') || l.includes('train')) {
    return {
      type: 'process',
      phase: 'COMPUTE & LOGIC',
      badgeClass: 'stage-badge--process',
      io: {
        input: 'Verified request entity & user session',
        operation: 'Business entity construction / local iteration',
        output: 'Staged entity ready for persistence',
      },
    };
  }

  if (l.includes('database') || l.includes('aggregate')) {
    return {
      type: 'database',
      phase: 'PERSISTENCE & STATE',
      badgeClass: 'stage-badge--database',
      io: {
        input: 'Staged booking record / model parameter updates',
        operation: 'Atomic database transaction commit',
        output: 'Durable relational state recorded in storage',
      },
    };
  }

  if (l.includes('admin') || l.includes('review') || l.includes('predict')) {
    return {
      type: 'review',
      phase: 'OPERATIONAL VERIFICATION',
      badgeClass: 'stage-badge--review',
      io: {
        input: 'Committed pending record / test vector',
        operation: 'Administrative inspection / model inference',
        output: 'Lifecycle decision / final prediction classification',
      },
    };
  }

  // Result / default
  return {
    type: 'result',
    phase: 'TERMINAL STATE',
    badgeClass: 'stage-badge--result',
    io: {
      input: 'Finalized transaction state / outcome data',
      operation: 'UI rendering & confirmation response dispatch',
      output: 'Live confirmation screen & persistent success state',
    },
  };
}

/**
 * Render lightweight SVG node icons for distinct stage types
 */
function StageIcon({ type, className = '' }) {
  switch (type) {
    case 'input':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="14" height="12" rx="2" />
          <path d="M7 8h2m-2 4h6" />
        </svg>
      );
    case 'validate':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 2l6 3v5c0 4.5-2.8 7.5-6 8.5C6.8 17.5 4 14.5 4 10V5l6-3z" />
          <path d="M8 10l1.5 1.5L12.5 8" />
        </svg>
      );
    case 'query':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="9" r="5" />
          <path d="M16 16l-3.5-3.5" />
          <path d="M9 7v4m-2-2h4" />
        </svg>
      );
    case 'process':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="3" />
          <path d="M10 2v2m0 12v2M2 10h2m12 0h2m-3.3-5.7l-1.4 1.4m-6.6 6.6l-1.4 1.4m0-9.4l1.4 1.4m6.6 6.6l1.4 1.4" />
        </svg>
      );
    case 'database':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse cx="10" cy="5" rx="6" ry="2.5" />
          <path d="M4 5v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V5" />
          <path d="M4 10v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5" />
        </svg>
      );
    case 'review':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="7" r="3.5" />
          <path d="M4 17c0-3.3 2.7-5 6-5s6 1.7 6 5" />
        </svg>
      );
    case 'result':
    default:
      return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="7" />
          <path d="M7 10l2 2 4-4" />
        </svg>
      );
  }
}

/**
 * DataFlow
 *
 * Highly visual, architectural request & data journey through validation,
 * controllers, relational persistence, and final system resolution.
 */
export default function DataFlow({ project }) {
  const steps = project.dataFlow || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  const [prevProjectId, setPrevProjectId] = useState(project.id);
  if (project.id !== prevProjectId) {
    setPrevProjectId(project.id);
    setActiveIndex(0);
    setIsPlaying(false);
  }

  // Handle auto-walkthrough playback
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % steps.length);
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  if (steps.length === 0) return null;

  const currentStep = steps[activeIndex] || steps[0];
  const meta = getStageMetadata(currentStep.step, currentStep.label);
  const progressPercent = ((activeIndex) / (steps.length - 1 || 1)) * 100;

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveIndex((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="build-dataflow" role="region" aria-label={`Request & Data Flow for ${project.title}`}>
      {/* SECTION HEADER */}
      <div className="build-section-head">
        <span className="build-accent-bar" aria-hidden="true" />
        <div className="build-dataflow__title-row">
          <div>
            <h2 className="build-section-title">From Input to Result</h2>
            <p className="build-section-subtitle">
              How data and user requests travel through validation, controllers, and computation to output.
            </p>
          </div>
          <div className="build-dataflow__trace-badge font-mono">
            <span className="build-dataflow__pulse-dot" aria-hidden="true" />
            <span>LIVE PIPELINE TRACE • {steps.length} VERIFIED STAGES</span>
          </div>
        </div>
      </div>

      <div className="build-dataflow__container">
        {/* INTERACTIVE PIPELINE TRACK / STEPPER RAIL */}
        <div className="dataflow-rail-container">
          <div className="dataflow-rail-track" aria-hidden="true">
            <div
              className="dataflow-rail-progress"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="dataflow-rail-nodes" role="tablist" aria-label="Pipeline Stages">
            {steps.map((item, idx) => {
              const isActive = idx === activeIndex;
              const isPassed = idx < activeIndex;
              const itemMeta = getStageMetadata(item.step, item.label);

              return (
                <button
                  key={item.step}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Step ${item.step}: ${item.label}`}
                  className={`dataflow-rail-node ${isActive ? 'dataflow-rail-node--active' : ''} ${isPassed ? 'dataflow-rail-node--passed' : ''}`}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveIndex(idx);
                  }}
                >
                  <span className="dataflow-rail-node__circle">
                    <StageIcon type={itemMeta.type} className="dataflow-rail-node__icon" />
                    <span className="dataflow-rail-node__num font-mono">{item.step}</span>
                  </span>
                  <span className="dataflow-rail-node__name font-mono">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE STAGE SPOTLIGHT CARD */}
        <div className="dataflow-spotlight">
          <div className="dataflow-spotlight__header">
            <div className="dataflow-spotlight__meta">
              <span className={`dataflow-badge font-mono ${meta.badgeClass}`}>
                {meta.phase}
              </span>
              <span className="dataflow-step-counter font-mono">
                STAGE {activeIndex + 1} OF {steps.length}
              </span>
            </div>

            <div className="dataflow-controls">
              <button
                type="button"
                className={`dataflow-control-btn dataflow-control-btn--play ${isPlaying ? 'dataflow-control-btn--playing' : ''}`}
                onClick={togglePlay}
                title={isPlaying ? 'Pause Auto-Trace' : 'Start Auto-Trace Walkthrough'}
                aria-label={isPlaying ? 'Pause Auto-Trace' : 'Start Auto-Trace Walkthrough'}
              >
                {isPlaying ? (
                  <>
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                      <rect x="3" y="2" width="3.5" height="12" rx="1" />
                      <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
                    </svg>
                    <span>Pause Walkthrough</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
                      <path d="M4 2.5v11l9-5.5-9-5.5z" />
                    </svg>
                    <span>Play Walkthrough</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="dataflow-control-btn dataflow-control-btn--step"
                onClick={handlePrev}
                title="Previous Stage"
                aria-label="Previous Stage"
              >
                ← Prev
              </button>

              <button
                type="button"
                className="dataflow-control-btn dataflow-control-btn--step"
                onClick={handleNext}
                title="Next Stage"
                aria-label="Next Stage"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="dataflow-spotlight__body">
            <div className="dataflow-spotlight__primary">
              <div className="dataflow-spotlight__stage-title">
                <span className="dataflow-spotlight__num font-mono">{currentStep.step}</span>
                <h3 className="dataflow-spotlight__heading">{currentStep.label}</h3>
              </div>
              <p className="dataflow-spotlight__desc">{currentStep.text}</p>
            </div>

            {/* CONCRETE ARCHITECTURAL I/O SPECS */}
            <div className="dataflow-io-panel">
              <div className="dataflow-io-item">
                <span className="dataflow-io-label font-mono">INPUT</span>
                <span className="dataflow-io-val">{meta.io.input}</span>
              </div>
              <div className="dataflow-io-item dataflow-io-item--highlight">
                <span className="dataflow-io-label font-mono">OPERATION</span>
                <span className="dataflow-io-val">{meta.io.operation}</span>
              </div>
              <div className="dataflow-io-item">
                <span className="dataflow-io-label font-mono">OUTPUT</span>
                <span className="dataflow-io-val">{meta.io.output}</span>
              </div>
            </div>
          </div>
        </div>

        {/* COMPLETE CONNECTED PIPELINE GRID */}
        <div className="dataflow-grid-wrapper">
          <div className="dataflow-grid-header">
            <h4 className="dataflow-grid-title font-mono">FULL PIPELINE CONDUIT MAP</h4>
            <span className="dataflow-grid-hint">Click any stage node to inspect its internal logic</span>
          </div>

          <div className="dataflow-conduit-grid">
            {steps.map((item, idx) => {
              const isActive = idx === activeIndex;
              const isPassed = idx < activeIndex;
              const itemMeta = getStageMetadata(item.step, item.label);
              const isLast = idx === steps.length - 1;

              return (
                <div
                  key={item.step}
                  className={`dataflow-card ${isActive ? 'dataflow-card--active' : ''} ${isPassed ? 'dataflow-card--passed' : ''}`}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveIndex(idx);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setIsPlaying(false);
                      setActiveIndex(idx);
                    }
                  }}
                  aria-label={`Inspect Stage ${item.step}: ${item.label}`}
                >
                  <div className="dataflow-card__top">
                    <div className="dataflow-card__node-ident">
                      <span className="dataflow-card__icon-box">
                        <StageIcon type={itemMeta.type} className="dataflow-card__icon" />
                      </span>
                      <span className="dataflow-card__step font-mono">{item.step}</span>
                    </div>
                    <span className={`dataflow-card__phase font-mono ${itemMeta.badgeClass}`}>
                      {itemMeta.phase}
                    </span>
                  </div>

                  <h4 className="dataflow-card__label font-mono">{item.label}</h4>
                  <p className="dataflow-card__desc">{item.text}</p>

                  <div className="dataflow-card__footer">
                    {!isLast ? (
                      <span className="dataflow-card__next-indicator font-mono">
                        Pipes to Stage {steps[idx + 1].step} →
                      </span>
                    ) : (
                      <span className="dataflow-card__next-indicator dataflow-card__next-indicator--complete font-mono">
                        ✓ Terminal Verification
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
