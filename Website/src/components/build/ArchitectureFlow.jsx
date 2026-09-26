import React from 'react';

/**
 * ArchitectureFlow
 * Clean visual flow diagram of the 7-stage system architecture.
 * Implements an accessible text representation alongside the visual pipeline.
 */
export default function ArchitectureFlow({ project }) {
  const steps = project.architectureSteps || [];

  return (
    <div className="build-architecture" role="region" aria-label={`System Architecture for ${project.title}`}>
      <div className="build-section-head">
        <span className="build-accent-bar" aria-hidden="true" />
        <h2 className="build-section-title">System Architecture</h2>
        <p className="build-section-subtitle">
          Sequential execution pipeline showing how data, validation, and control flow through the system.
        </p>
      </div>

      {/* Screen-reader accessible transcript of the pipeline */}
      <div className="sr-only">
        <ol>
          {steps.map((step) => (
            <li key={step.id}>
              {step.title}: {step.detail}
            </li>
          ))}
        </ol>
      </div>

      {/* Visual Flow Pipeline */}
      <div className="architecture-pipeline" aria-hidden="true">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="architecture-node">
                <div className="architecture-node__badge font-mono">
                  STAGE {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="architecture-node__title font-mono">
                  {step.title}
                </h3>
                <p className="architecture-node__detail">
                  {step.detail}
                </p>
              </div>

              {!isLast && (
                <div className="architecture-connector">
                  <div className="architecture-connector__line" />
                  <span className="architecture-connector__arrow">↓</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
