import React from 'react';

/**
 * WorkflowProgress Component
 * Renders interactive visual pipeline stages for Federated Learning simulation.
 *
 * @param {Object} props
 * @param {Array} props.stages - Array of stage objects
 * @param {number} props.activeStageIndex - Current active or completed index
 * @param {boolean} props.isFailed - Whether pipeline failed at active stage
 * @param {boolean} props.isComplete - Whether entire pipeline completed successfully
 */
export default function WorkflowProgress({
  stages,
  activeStageIndex,
  isFailed = false,
  isComplete = false,
}) {
  return (
    <div className="workflow-progress" role="region" aria-label="Pipeline Stages Progress">
      <div className="workflow-progress__track">
        {stages.map((stage, idx) => {
          let status = 'pending';
          if (isFailed && idx === activeStageIndex) {
            status = 'failed';
          } else if (idx < activeStageIndex || isComplete) {
            status = 'completed';
          } else if (idx === activeStageIndex) {
            status = 'active';
          }

          return (
            <div
              key={stage.key}
              className={`workflow-step workflow-step--${status}`}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <div className="workflow-step__marker" aria-hidden="true">
                {status === 'completed' && <span className="workflow-step__icon">✓</span>}
                {status === 'failed' && <span className="workflow-step__icon">✕</span>}
                {status === 'active' && <span className="workflow-step__dot" />}
                {status === 'pending' && <span className="workflow-step__num font-mono">{idx + 1}</span>}
              </div>
              <span className="workflow-step__label font-mono">
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
