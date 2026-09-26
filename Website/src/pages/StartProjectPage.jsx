import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { projectRequestsApi } from '../services/api';
import { trackEvent } from '../utils/analytics';
import './StartProjectPage.css';

/**
 * Start a Project / Project Requirement Builder
 * Multi-step inquiry flow:
 * Step 1: Project Type
 * Step 2: Project Details
 * Step 3: Scope & Timeline
 * Step 4: Contact Details
 * Step 5: Review & Confirmation
 */
export default function StartProjectPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const location = useLocation();

  // Form State initialized directly from transferred Project Brief (if present)
  const [formData, setFormData] = useState(() => {
    const brief = location.state?.projectBrief;
    let mappedType = '';
    let featuresStr = '';

    if (brief) {
      if (brief.projectType === 'Web Application') mappedType = 'Web Application';
      else if (brief.projectType === 'Backend / API') mappedType = 'Backend / API';
      else if (brief.projectType === 'Database / SQL') mappedType = 'Database / SQL Solution';
      else if (brief.projectType === 'College / Academic Project') mappedType = 'College / Academic Project';
      else if (brief.projectType === 'Custom Software') mappedType = 'Custom Software';
      else if (brief.projectType === 'Other') mappedType = 'Other';
      else if (brief.projectType) mappedType = brief.projectType;

      featuresStr = Array.isArray(brief.features)
        ? brief.features.join(', ')
        : (brief.features || '');
    }

    return {
      // Step 1
      projectType: mappedType,
      // Step 2
      projectName: brief?.projectName || '',
      problemRequirement: brief?.problem || '',
      featuresNeeded: featuresStr,
      techPreference: brief?.techPreference || '',
      // Step 3
      timeline: brief?.timeline && brief.timeline !== 'Not decided' ? brief.timeline : '',
      budget: brief?.budget && brief.budget !== 'Not decided' ? brief.budget : '',
      additionalRequirements: brief?.additionalRequirements || '',
      // Step 4
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      preferredContact: 'Email',
      contactMessage: '',
    };
  });

  const [errors, setErrors] = useState({});

  // Scroll to top when step changes or page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, isSuccess]);

  // Project Types for Step 1
  const projectTypes = [
    {
      id: 'web-app',
      label: 'Web Application',
      desc: 'Full stack web applications, interactive dashboards, and client portals.',
    },
    {
      id: 'backend-api',
      label: 'Backend / API',
      desc: 'REST APIs, server-side business logic, authentication, and integrations.',
    },
    {
      id: 'database-sql',
      label: 'Database / SQL Solution',
      desc: 'Relational data modeling, query optimization, joins, and database design.',
    },
    {
      id: 'academic',
      label: 'College / Academic Project',
      desc: 'Structured student projects, proof-of-concepts, and final-year builds.',
    },
    {
      id: 'custom-software',
      label: 'Custom Software',
      desc: 'Bespoke tools, internal operational systems, and practical automation.',
    },
    {
      id: 'other',
      label: 'Other',
      desc: 'A unique idea, consulting, or exploratory software requirement.',
    },
  ];

  // Timeline options for Step 3
  const timelineOptions = [
    'Less than 1 week',
    '1–2 weeks',
    '2–4 weeks',
    '1+ month',
    'Not decided',
  ];

  // Budget options for Step 3
  const budgetOptions = [
    'Student / Academic',
    'Small Project',
    'Medium Project',
    'Custom / Discuss',
    'Not decided',
  ];

  // Preferred Contact options for Step 4
  const preferredContactOptions = ['Email', 'Phone', 'WhatsApp'];

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Handle direct selection for chips/cards
  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.projectType) {
      newErrors.projectType = 'Please select a project type to continue.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Please enter a project name.';
    }
    if (!formData.problemRequirement.trim()) {
      newErrors.problemRequirement = 'Please describe the problem or requirement.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation (Timeline & Budget are optional but recommended; validate non-empty if strictly required)
  const validateStep3 = () => {
    // Timeline and Budget are optional selectable options
    setErrors({});
    return true;
  };

  // Step 4 Validation
  const validateStep4 = () => {
    const newErrors = {};
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Please enter your name.';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Please enter your email address.';
    } else if (!emailRegex.test(formData.contactEmail.trim())) {
      newErrors.contactEmail = 'Please enter a valid email address (e.g. you@example.com).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Continue to next step
  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();
    else if (currentStep === 4) isValid = validateStep4();

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  // Go back to previous step
  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Jump to specific step from Review
  const handleEditStep = (stepNumber) => {
    setErrors({});
    setCurrentStep(stepNumber);
  };

  // Submit Project Request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      !formData.projectType ||
      !formData.projectName.trim() ||
      !formData.problemRequirement.trim() ||
      !formData.contactName.trim() ||
      !formData.contactEmail.trim()
    ) {
      setSubmitError('Please complete all required fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        project_type: formData.projectType,
        project_name: formData.projectName.trim(),
        requirement: formData.problemRequirement.trim(),
        features: formData.featuresNeeded.trim() || undefined,
        technology_preference: formData.techPreference.trim() || undefined,
        timeline: formData.timeline.trim() || undefined,
        budget_range: formData.budget.trim() || undefined,
        additional_requirements: formData.additionalRequirements.trim() || undefined,
        name: formData.contactName.trim(),
        email: formData.contactEmail.trim(),
        phone: formData.contactPhone.trim() || undefined,
        preferred_contact: formData.preferredContact || undefined,
        message: formData.contactMessage.trim() || undefined,
      };

      await projectRequestsApi.submit(payload);
      setIsSuccess(true);
      trackEvent({
        eventType: 'project_request_submitted',
        path: '/start-a-project',
        metadata: { project_type: formData.projectType },
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit project request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step names for progress indicator
  const steps = [
    { number: '01', name: 'Project' },
    { number: '02', name: 'Details' },
    { number: '03', name: 'Scope' },
    { number: '04', name: 'Contact' },
    { number: '05', name: 'Review' },
  ];

  return (
    <div className="start-project-page">
      <div className="start-project-container">
        {/* Header Eyebrow & Title */}
        <header className="start-project__header">
          <div className="start-project__eyebrow badge badge--accent font-mono">
            <span className="start-project__eyebrow-dot" aria-hidden="true" />
            <span>START A PROJECT</span>
          </div>
          <h1 className="start-project__main-title">Project Requirement Builder</h1>
          <p className="start-project__main-desc">
            Define your project requirement step by step. We will structure your vision into a practical, actionable plan.
          </p>
        </header>

        {/* Success View */}
        {isSuccess ? (
          <div className="start-project-card start-project-card--success" role="region" aria-label="Project Brief Summary">
            <div className="start-project-success__badge font-mono">CONFIRMATION</div>
            <h2 className="start-project-success__title">Project Request Submitted</h2>
            <p className="start-project-success__desc">
              Thanks for sharing your project idea. Your request has been received.
            </p>

            <div className="start-project-success__summary">
              <div className="success-summary-item">
                <span className="success-summary-item__label font-mono">Project Type</span>
                <span className="success-summary-item__value">{formData.projectType || 'Not specified'}</span>
              </div>
              <div className="success-summary-item">
                <span className="success-summary-item__label font-mono">Project Name</span>
                <span className="success-summary-item__value">{formData.projectName || 'Untitled'}</span>
              </div>
              <div className="success-summary-item">
                <span className="success-summary-item__label font-mono">Contact</span>
                <span className="success-summary-item__value">{formData.contactName} ({formData.contactEmail})</span>
              </div>
            </div>

            <div className="start-project-success__actions">
              <Link to="/" className="start-project__btn start-project__btn--primary">
                Back to Home →
              </Link>
            </div>
          </div>
        ) : (
          /* Multi-Step Flow Container */
          <div className="start-project-flow">
            {/* Discovery Banner for Project Brief Assistant */}
            <div className="start-project-assistant-banner">
              <span className="start-project-assistant-banner__text">
                Need help defining the idea first?
              </span>
              <Link to="/project-assistant" className="start-project-assistant-banner__link">
                Use the Project Brief Assistant →
              </Link>
            </div>

            {/* Optional Pre-filled notification from Project Brief Assistant */}
            {location.state?.projectBrief && (
              <div className="start-project-prefilled-notice" role="status">
                <span>✓</span>
                <span>Requirements prefilled from your Project Brief Assistant session.</span>
              </div>
            )}

            {/* Progress Indicator */}
            <nav className="start-project-progress" aria-label="Project Builder Progress">
              <ol className="start-project-progress__list">
                {steps.map((s, idx) => {
                  const stepNumber = idx + 1;
                  const isCurrent = currentStep === stepNumber;
                  const isCompleted = currentStep > stepNumber;

                  return (
                    <li
                      key={s.number}
                      className={`start-project-progress__item ${
                        isCurrent ? 'start-project-progress__item--current' : ''
                      } ${isCompleted ? 'start-project-progress__item--completed' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => isCompleted && handleEditStep(stepNumber)}
                        disabled={!isCompleted}
                        className="start-project-progress__btn"
                        aria-current={isCurrent ? 'step' : undefined}
                      >
                        <span className="start-project-progress__num font-mono">
                          {isCompleted ? '✓' : s.number}
                        </span>
                        <span className="start-project-progress__name">{s.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Current Step Card */}
            <div className="start-project-card">
              {/* ============================================================
                  STEP 1: PROJECT TYPE
                  ============================================================ */}
              {currentStep === 1 && (
                <section className="start-project-step" aria-labelledby="heading-step-1">
                  <div className="start-project-step__header">
                    <span className="start-project-step__badge font-mono">STEP 01 OF 05</span>
                    <h2 id="heading-step-1" className="start-project-step__title">
                      What are you looking to build?
                    </h2>
                    <p className="start-project-step__desc">
                      Tell me what you have in mind and I’ll help turn the idea into a practical project plan.
                    </p>
                  </div>

                  {errors.projectType && (
                    <div className="start-project__alert" role="alert">
                      {errors.projectType}
                    </div>
                  )}

                  <div className="project-types-grid" role="radiogroup" aria-label="Project Type Selection">
                    {projectTypes.map((type) => {
                      const isSelected = formData.projectType === type.label;
                      return (
                        <div
                          key={type.id}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleSelect('projectType', type.label)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              handleSelect('projectType', type.label);
                            }
                          }}
                          className={`project-type-card ${
                            isSelected ? 'project-type-card--selected' : ''
                          }`}
                        >
                          <div className="project-type-card__header">
                            <span className="project-type-card__radio" aria-hidden="true">
                              {isSelected && <span className="project-type-card__dot" />}
                            </span>
                            <h3 className="project-type-card__label">{type.label}</h3>
                          </div>
                          <p className="project-type-card__desc">{type.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="start-project-step__actions start-project-step__actions--right">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="start-project__btn start-project__btn--primary"
                    >
                      Continue →
                    </button>
                  </div>
                </section>
              )}

              {/* ============================================================
                  STEP 2: PROJECT DETAILS
                  ============================================================ */}
              {currentStep === 2 && (
                <section className="start-project-step" aria-labelledby="heading-step-2">
                  <div className="start-project-step__header">
                    <span className="start-project-step__badge font-mono">STEP 02 OF 05</span>
                    <h2 id="heading-step-2" className="start-project-step__title">
                      Tell me about the project
                    </h2>
                    <p className="start-project-step__desc">
                      Share the key details so we can understand the problem, functionality, and technology stack.
                    </p>
                  </div>

                  <form className="start-project-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} noValidate>
                    {/* Project Name */}
                    <div className="start-project-field">
                      <label htmlFor="field-project-name" className="start-project-field__label">
                        Project Name <span className="start-project-field__req" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="field-project-name"
                        name="projectName"
                        type="text"
                        placeholder="e.g. Hotel Booking System"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        aria-required="true"
                        aria-invalid={errors.projectName ? 'true' : 'false'}
                        className={`start-project-field__input ${errors.projectName ? 'start-project-field__input--error' : ''}`}
                      />
                      {errors.projectName && (
                        <span className="start-project-field__error" role="alert">
                          {errors.projectName}
                        </span>
                      )}
                    </div>

                    {/* Problem / Requirement */}
                    <div className="start-project-field">
                      <label htmlFor="field-problem-requirement" className="start-project-field__label">
                        Problem / Requirement <span className="start-project-field__req" aria-hidden="true">*</span>
                      </label>
                      <textarea
                        id="field-problem-requirement"
                        name="problemRequirement"
                        rows="4"
                        placeholder="What problem are you trying to solve?"
                        value={formData.problemRequirement}
                        onChange={handleInputChange}
                        aria-required="true"
                        aria-invalid={errors.problemRequirement ? 'true' : 'false'}
                        className={`start-project-field__textarea ${errors.problemRequirement ? 'start-project-field__input--error' : ''}`}
                      />
                      {errors.problemRequirement && (
                        <span className="start-project-field__error" role="alert">
                          {errors.problemRequirement}
                        </span>
                      )}
                    </div>

                    {/* Features Needed */}
                    <div className="start-project-field">
                      <label htmlFor="field-features-needed" className="start-project-field__label">
                        Features Needed
                      </label>
                      <textarea
                        id="field-features-needed"
                        name="featuresNeeded"
                        rows="3"
                        placeholder="List the main features you need..."
                        value={formData.featuresNeeded}
                        onChange={handleInputChange}
                        className="start-project-field__textarea"
                      />
                    </div>

                    {/* Technology Preference */}
                    <div className="start-project-field">
                      <label htmlFor="field-tech-preference" className="start-project-field__label">
                        Technology Preference
                      </label>
                      <input
                        id="field-tech-preference"
                        name="techPreference"
                        type="text"
                        placeholder="e.g. Python, Flask, MySQL"
                        value={formData.techPreference}
                        onChange={handleInputChange}
                        className="start-project-field__input"
                      />
                    </div>

                    <div className="start-project-step__actions">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="start-project__btn start-project__btn--secondary"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="start-project__btn start-project__btn--primary"
                      >
                        Continue →
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* ============================================================
                  STEP 3: PROJECT SCOPE
                  ============================================================ */}
              {currentStep === 3 && (
                <section className="start-project-step" aria-labelledby="heading-step-3">
                  <div className="start-project-step__header">
                    <span className="start-project-step__badge font-mono">STEP 03 OF 05</span>
                    <h2 id="heading-step-3" className="start-project-step__title">
                      Let's understand the scope
                    </h2>
                    <p className="start-project-step__desc">
                      Indicate your timeline, estimated scale, and any specific constraints.
                    </p>
                  </div>

                  <form className="start-project-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} noValidate>
                    {/* Timeline */}
                    <div className="start-project-field">
                      <label className="start-project-field__label">
                        Timeline
                      </label>
                      <div className="choice-chips-grid" role="radiogroup" aria-label="Timeline Selection">
                        {timelineOptions.map((opt) => {
                          const isSelected = formData.timeline === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => handleSelect('timeline', opt)}
                              className={`choice-chip ${isSelected ? 'choice-chip--selected' : ''}`}
                            >
                              <span className="choice-chip__dot" aria-hidden="true" />
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div className="start-project-field">
                      <label className="start-project-field__label">
                        Budget Range
                      </label>
                      <div className="choice-chips-grid" role="radiogroup" aria-label="Budget Range Selection">
                        {budgetOptions.map((opt) => {
                          const isSelected = formData.budget === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => handleSelect('budget', opt)}
                              className={`choice-chip ${isSelected ? 'choice-chip--selected' : ''}`}
                            >
                              <span className="choice-chip__dot" aria-hidden="true" />
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional Requirements */}
                    <div className="start-project-field">
                      <label htmlFor="field-additional-req" className="start-project-field__label">
                        Additional Requirements
                      </label>
                      <textarea
                        id="field-additional-req"
                        name="additionalRequirements"
                        rows="3"
                        placeholder="Anything else I should know?"
                        value={formData.additionalRequirements}
                        onChange={handleInputChange}
                        className="start-project-field__textarea"
                      />
                    </div>

                    <div className="start-project-step__actions">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="start-project__btn start-project__btn--secondary"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="start-project__btn start-project__btn--primary"
                      >
                        Continue →
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* ============================================================
                  STEP 4: CONTACT DETAILS
                  ============================================================ */}
              {currentStep === 4 && (
                <section className="start-project-step" aria-labelledby="heading-step-4">
                  <div className="start-project-step__header">
                    <span className="start-project-step__badge font-mono">STEP 04 OF 05</span>
                    <h2 id="heading-step-4" className="start-project-step__title">
                      Where can I reach you?
                    </h2>
                    <p className="start-project-step__desc">
                      Provide your details so I can get in touch to discuss your project plan.
                    </p>
                  </div>

                  <form className="start-project-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }} noValidate>
                    {/* Name */}
                    <div className="start-project-field">
                      <label htmlFor="field-contact-name" className="start-project-field__label">
                        Name <span className="start-project-field__req" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="field-contact-name"
                        name="contactName"
                        type="text"
                        placeholder="Your name"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        aria-required="true"
                        aria-invalid={errors.contactName ? 'true' : 'false'}
                        className={`start-project-field__input ${errors.contactName ? 'start-project-field__input--error' : ''}`}
                      />
                      {errors.contactName && (
                        <span className="start-project-field__error" role="alert">
                          {errors.contactName}
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="start-project-field">
                      <label htmlFor="field-contact-email" className="start-project-field__label">
                        Email <span className="start-project-field__req" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="field-contact-email"
                        name="contactEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        aria-required="true"
                        aria-invalid={errors.contactEmail ? 'true' : 'false'}
                        className={`start-project-field__input ${errors.contactEmail ? 'start-project-field__input--error' : ''}`}
                      />
                      {errors.contactEmail && (
                        <span className="start-project-field__error" role="alert">
                          {errors.contactEmail}
                        </span>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="start-project-field">
                      <label htmlFor="field-contact-phone" className="start-project-field__label">
                        Phone
                      </label>
                      <input
                        id="field-contact-phone"
                        name="contactPhone"
                        type="tel"
                        placeholder="Your phone number"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="start-project-field__input"
                      />
                    </div>

                    {/* Preferred Contact Method */}
                    <div className="start-project-field">
                      <label className="start-project-field__label">
                        Preferred Contact
                      </label>
                      <div className="choice-chips-grid choice-chips-grid--3" role="radiogroup" aria-label="Preferred Contact Channel">
                        {preferredContactOptions.map((opt) => {
                          const isSelected = formData.preferredContact === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => handleSelect('preferredContact', opt)}
                              className={`choice-chip ${isSelected ? 'choice-chip--selected' : ''}`}
                            >
                              <span className="choice-chip__dot" aria-hidden="true" />
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="start-project-field">
                      <label htmlFor="field-contact-message" className="start-project-field__label">
                        Message
                      </label>
                      <textarea
                        id="field-contact-message"
                        name="contactMessage"
                        rows="3"
                        placeholder="Anything else you would like to mention?"
                        value={formData.contactMessage}
                        onChange={handleInputChange}
                        className="start-project-field__textarea"
                      />
                    </div>

                    <div className="start-project-step__actions">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="start-project__btn start-project__btn--secondary"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="start-project__btn start-project__btn--primary"
                      >
                        Review Project →
                      </button>
                    </div>
                  </form>
                </section>
              )}

              {/* ============================================================
                  STEP 5: REVIEW
                  ============================================================ */}
              {currentStep === 5 && (
                <section className="start-project-step" aria-labelledby="heading-step-5">
                  <div className="start-project-step__header">
                    <span className="start-project-step__badge font-mono">STEP 05 OF 05</span>
                    <h2 id="heading-step-5" className="start-project-step__title">
                      Review your project
                    </h2>
                    <p className="start-project-step__desc">
                      Verify your requirement summary before preparing the project request.
                    </p>
                  </div>

                  <div className="review-sections">
                    {/* Section 1: Project Type */}
                    <div className="review-section">
                      <div className="review-section__header">
                        <h3 className="review-section__title">01. Project Type</h3>
                        <button
                          type="button"
                          onClick={() => handleEditStep(1)}
                          className="review-section__edit-btn font-mono"
                        >
                          ← Edit
                        </button>
                      </div>
                      <div className="review-section__content">
                        <span className="review-tag font-mono">{formData.projectType || 'None selected'}</span>
                      </div>
                    </div>

                    {/* Section 2: Project Details */}
                    <div className="review-section">
                      <div className="review-section__header">
                        <h3 className="review-section__title">02. Project Details</h3>
                        <button
                          type="button"
                          onClick={() => handleEditStep(2)}
                          className="review-section__edit-btn font-mono"
                        >
                          ← Edit
                        </button>
                      </div>
                      <div className="review-section__content">
                        <div className="review-item">
                          <span className="review-item__label font-mono">Project Name:</span>
                          <span className="review-item__value">{formData.projectName || '—'}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-item__label font-mono">Problem / Requirement:</span>
                          <p className="review-item__paragraph">{formData.problemRequirement || '—'}</p>
                        </div>
                        {formData.featuresNeeded && (
                          <div className="review-item">
                            <span className="review-item__label font-mono">Features Needed:</span>
                            <p className="review-item__paragraph">{formData.featuresNeeded}</p>
                          </div>
                        )}
                        {formData.techPreference && (
                          <div className="review-item">
                            <span className="review-item__label font-mono">Technology Preference:</span>
                            <span className="review-item__value">{formData.techPreference}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Scope */}
                    <div className="review-section">
                      <div className="review-section__header">
                        <h3 className="review-section__title">03. Scope</h3>
                        <button
                          type="button"
                          onClick={() => handleEditStep(3)}
                          className="review-section__edit-btn font-mono"
                        >
                          ← Edit
                        </button>
                      </div>
                      <div className="review-section__content">
                        <div className="review-item">
                          <span className="review-item__label font-mono">Timeline:</span>
                          <span className="review-item__value">{formData.timeline || 'Not decided'}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-item__label font-mono">Budget Range:</span>
                          <span className="review-item__value">{formData.budget || 'Not decided'}</span>
                        </div>
                        {formData.additionalRequirements && (
                          <div className="review-item">
                            <span className="review-item__label font-mono">Additional Requirements:</span>
                            <p className="review-item__paragraph">{formData.additionalRequirements}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 4: Contact */}
                    <div className="review-section">
                      <div className="review-section__header">
                        <h3 className="review-section__title">04. Contact Details</h3>
                        <button
                          type="button"
                          onClick={() => handleEditStep(4)}
                          className="review-section__edit-btn font-mono"
                        >
                          ← Edit
                        </button>
                      </div>
                      <div className="review-section__content">
                        <div className="review-item">
                          <span className="review-item__label font-mono">Name:</span>
                          <span className="review-item__value">{formData.contactName || '—'}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-item__label font-mono">Email:</span>
                          <span className="review-item__value">{formData.contactEmail || '—'}</span>
                        </div>
                        {formData.contactPhone && (
                          <div className="review-item">
                            <span className="review-item__label font-mono">Phone:</span>
                            <span className="review-item__value">{formData.contactPhone}</span>
                          </div>
                        )}
                        <div className="review-item">
                          <span className="review-item__label font-mono">Preferred Channel:</span>
                          <span className="review-item__value">{formData.preferredContact}</span>
                        </div>
                        {formData.contactMessage && (
                          <div className="review-item">
                            <span className="review-item__label font-mono">Message:</span>
                            <p className="review-item__paragraph">{formData.contactMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="start-project-error-banner font-mono" role="alert">
                      {submitError}
                    </div>
                  )}

                  <div className="start-project-step__actions">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="start-project__btn start-project__btn--secondary"
                    >
                      ← Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="start-project__btn start-project__btn--primary"
                    >
                      {isSubmitting ? 'Submitting Request...' : 'Submit Project Request →'}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
