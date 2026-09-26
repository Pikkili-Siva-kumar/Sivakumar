import React from 'react';
import AssistantStep from './AssistantStep';
import './ProjectAssistantSteps.css';

/**
 * ProblemStep Component (Step 2)
 * Collects project name and core problem description.
 */
export default function ProblemStep({
  projectName,
  problem,
  onChangeField,
  onBack,
  onNext,
  onReset,
  error,
}) {
  return (
    <AssistantStep
      stepNumber="02"
      heading="What problem are you trying to solve?"
      subheading="Give your project a working title and describe the core real-world issue it addresses."
      error={error}
      onBack={onBack}
      onNext={onNext}
      onReset={onReset}
      nextLabel="Next: Specify Features →"
    >
      <div className="assistant-form-fields">
        {/* Project Name Field */}
        <div className="assistant-field-group">
          <label htmlFor="assistant-project-name" className="assistant-label">
            Project Name <span className="assistant-required" aria-hidden="true">*</span>
          </label>
          <input
            id="assistant-project-name"
            name="projectName"
            type="text"
            className="assistant-input"
            placeholder="e.g., Room Booking System or Inventory Tracker"
            value={projectName}
            onChange={(e) => onChangeField('projectName', e.target.value)}
            maxLength={100}
            required
          />
          <span className="assistant-help-text">A clear, concise working name for this project.</span>
        </div>

        {/* Problem Description Field */}
        <div className="assistant-field-group">
          <label htmlFor="assistant-problem-desc" className="assistant-label">
            Describe the problem in your own words <span className="assistant-required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="assistant-problem-desc"
            name="problem"
            rows={5}
            className="assistant-textarea"
            placeholder="Example: I want a system where users can book rooms without duplicate reservations."
            value={problem}
            onChange={(e) => onChangeField('problem', e.target.value)}
            required
          />
          <span className="assistant-help-text">
            Explain who is facing this problem and what happens if it is not solved.
          </span>
        </div>
      </div>
    </AssistantStep>
  );
}
