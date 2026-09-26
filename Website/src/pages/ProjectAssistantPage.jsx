import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import AssistantProgress from '../components/projectAssistant/AssistantProgress';
import ProjectTypeStep from '../components/projectAssistant/ProjectTypeStep';
import ProblemStep from '../components/projectAssistant/ProblemStep';
import FeaturesStep from '../components/projectAssistant/FeaturesStep';
import ScopeStep from '../components/projectAssistant/ScopeStep';
import ReviewStep from '../components/projectAssistant/ReviewStep';
import './ProjectAssistantPage.css';

const STEPS = [
  { number: '01', title: 'Project Type' },
  { number: '02', title: 'Problem' },
  { number: '03', title: 'Features' },
  { number: '04', title: 'Scope' },
  { number: '05', title: 'Review' },
];

const INITIAL_FORM_STATE = {
  projectType: '',
  projectName: '',
  problem: '',
  features: [],
  timeline: 'Not decided',
  budget: 'Not decided',
  techPreference: '',
  additionalRequirements: '',
};

/**
 * ProjectBriefAssistantPage Component
 * Route: /project-assistant
 * Step 34: Guided, deterministic project brief generator.
 *
 * Helps visitors turn rough software ideas into a structured project brief
 * before optionally continuing to the Project Requirement Builder.
 */
export default function ProjectAssistantPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Project Brief Assistant | Siva Kumar';
  }, [currentStep]);

  // Validation handlers
  const validateStep = (stepNumber) => {
    setError('');

    if (stepNumber === 1) {
      if (!formData.projectType) {
        setError('Please choose a project type.');
        return false;
      }
    } else if (stepNumber === 2) {
      if (!formData.projectName.trim()) {
        setError('Please enter a project name.');
        return false;
      }
      if (!formData.problem.trim()) {
        setError('Please describe the problem.');
        return false;
      }
    } else if (stepNumber === 3) {
      if (formData.features.length === 0) {
        setError('Add at least one feature.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleReset = () => {
    setError('');
    setFormData(INITIAL_FORM_STATE);
    setCurrentStep(1);
  };

  const handleJumpToStep = (stepNumber) => {
    setError('');
    setCurrentStep(stepNumber);
  };

  // Field change handler
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  // Feature list handlers
  const handleAddFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, feature],
    }));
    if (error) setError('');
  };

  const handleUpdateFeature = (index, updatedFeature) => {
    setFormData((prev) => {
      const nextFeatures = [...prev.features];
      nextFeatures[index] = updatedFeature;
      return { ...prev, features: nextFeatures };
    });
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index),
    }));
  };

  // Handoff to Project Builder
  const handleContinueToBuilder = () => {
    navigate('/start-a-project', {
      state: {
        projectBrief: formData,
      },
    });
  };

  return (
    <div className="project-assistant-page">
      <Container size="default">
        {/* Navigation Breadcrumb */}
        <nav className="assistant-nav" aria-label="Breadcrumb navigation">
          <Link to="/start-a-project" className="assistant-nav__back-link">
            <span className="assistant-nav__arrow" aria-hidden="true">←</span>
            <span>Project Builder</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="assistant-hero">
          <div className="assistant-hero__badge badge font-mono">
            <span className="assistant-hero__badge-dot" aria-hidden="true" />
            <span>PROJECT BRIEF ASSISTANT</span>
          </div>

          <h1 className="assistant-hero__heading">
            Turn the Idea Into a Plan.
          </h1>

          <p className="assistant-hero__subheading">
            Answer a few practical questions and turn your rough idea into a structured project brief.
          </p>

          <div className="assistant-hero__progression font-mono" aria-label="Workflow progression">
            <span className="assistant-hero__stage">Idea</span>
            <span className="assistant-hero__arrow" aria-hidden="true">→</span>
            <span className="assistant-hero__stage">Requirements</span>
            <span className="assistant-hero__arrow" aria-hidden="true">→</span>
            <span className="assistant-hero__stage">Scope</span>
            <span className="assistant-hero__arrow" aria-hidden="true">→</span>
            <span className="assistant-hero__stage">Project Brief</span>
          </div>
        </header>

        {/* Contextual Discovery Bridge to AI Assistant */}
        <div className="assistant-ai-bridge">
          <span className="assistant-ai-bridge__text font-mono">
            Want a more natural AI-guided version?
          </span>
          <Link to="/ai-project-assistant" className="assistant-ai-bridge__link font-mono">
            Try the AI Project Assistant →
          </Link>
        </div>

        {/* Interactive Guided Flow */}
        <main className="assistant-main-flow">
          {/* Step Progress Bar */}
          <AssistantProgress
            currentStep={currentStep}
            steps={STEPS}
            onStepClick={handleJumpToStep}
          />

          {/* Current Step Component */}
          <div className="assistant-step-container">
            {currentStep === 1 && (
              <ProjectTypeStep
                selectedType={formData.projectType}
                onSelectType={(type) => handleFieldChange('projectType', type)}
                onNext={handleNext}
                onReset={handleReset}
                error={error}
              />
            )}

            {currentStep === 2 && (
              <ProblemStep
                projectName={formData.projectName}
                problem={formData.problem}
                onChangeField={handleFieldChange}
                onBack={handleBack}
                onNext={handleNext}
                onReset={handleReset}
                error={error}
              />
            )}

            {currentStep === 3 && (
              <FeaturesStep
                projectType={formData.projectType}
                features={formData.features}
                onAddFeature={handleAddFeature}
                onUpdateFeature={handleUpdateFeature}
                onRemoveFeature={handleRemoveFeature}
                onBack={handleBack}
                onNext={handleNext}
                onReset={handleReset}
                error={error}
              />
            )}

            {currentStep === 4 && (
              <ScopeStep
                timeline={formData.timeline}
                budget={formData.budget}
                techPreference={formData.techPreference}
                additionalRequirements={formData.additionalRequirements}
                onChangeField={handleFieldChange}
                onBack={handleBack}
                onNext={handleNext}
                onReset={handleReset}
                error={error}
              />
            )}

            {currentStep === 5 && (
              <ReviewStep
                formData={formData}
                onEditStep={handleJumpToStep}
                onReset={handleReset}
                onContinueToBuilder={handleContinueToBuilder}
              />
            )}
          </div>
        </main>
      </Container>
    </div>
  );
}
