import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../components/common/Container';
import { aiApi } from '../services/api';
import './AIProjectAssistantPage.css';

/**
 * AIProjectAssistantPage Component
 * Route: /ai-project-assistant
 * Step 38: Real Gemini AI Project Assistant
 *
 * Uses Google Gemini on the backend to analyze natural-language project ideas
 * and generate structured, editable requirements briefs.
 */
export default function AIProjectAssistantPage() {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [brief, setBrief] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'AI Project Assistant | Siva Kumar';
  }, []);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await aiApi.generateProjectBrief(cleanMessage);
      if (res && res.status === 'ok' && res.brief) {
        setBrief(res.brief);
        setHistory([
          { role: 'user', text: cleanMessage },
          { role: 'assistant', brief: res.brief },
        ]);
        setMessage('');
      } else {
        setError(res?.message || 'Unable to generate project brief. Please try again.');
      }
    } catch (err) {
      const msg = err?.message || 'AI assistant is temporarily unavailable. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (e) => {
    if (e) e.preventDefault();
    const cleanFollowUp = followUpMessage.trim();
    if (!cleanFollowUp || isLoading || !brief) return;

    setIsLoading(true);
    setError(null);

    const context = {
      project_type: brief.projectType,
      previous_brief: brief,
      history: history.map((h) => ({
        role: h.role,
        text: h.text || (h.brief ? h.brief.projectTitle : ''),
      })),
    };

    try {
      const res = await aiApi.generateProjectBrief(cleanFollowUp, context);
      if (res && res.status === 'ok' && res.brief) {
        setBrief(res.brief);
        setHistory((prev) => [
          ...prev,
          { role: 'user', text: cleanFollowUp },
          { role: 'assistant', brief: res.brief },
        ]);
        setFollowUpMessage('');
      } else {
        setError(res?.message || 'Unable to update project brief. Please try again.');
      }
    } catch (err) {
      const msg = err?.message || 'AI assistant is temporarily unavailable. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setBrief(null);
    setMessage('');
    setFollowUpMessage('');
    setError(null);
    setHistory([]);
  };

  const handleContinueToBuilder = () => {
    if (!brief) return;

    // Map AI brief fields into compatible Project Builder format
    let mappedType = 'Web Application';
    const lowerType = (brief.projectType || '').toLowerCase();
    if (lowerType.includes('backend') || lowerType.includes('api')) {
      mappedType = 'Backend / API';
    } else if (lowerType.includes('database') || lowerType.includes('sql')) {
      mappedType = 'Database / SQL Solution';
    } else if (lowerType.includes('academic') || lowerType.includes('college')) {
      mappedType = 'College / Academic Project';
    } else if (lowerType.includes('custom')) {
      mappedType = 'Custom Software';
    }

    const featuresList = (brief.coreFeatures || []).map(
      (f) => `${f.title} [${f.tag || 'AI SUGGESTION'}]`
    );

    const techList = (brief.recommendedStack || []).map((s) => s.name).join(', ');

    const additionalNotes = [
      brief.suggestedScope ? `Scope: ${brief.suggestedScope}` : '',
      brief.questionsToClarify && brief.questionsToClarify.length > 0
        ? `Clarifications Needed:\n• ${brief.questionsToClarify.join('\n• ')}`
        : '',
      brief.nextSteps && brief.nextSteps.length > 0
        ? `Recommended Next Steps:\n• ${brief.nextSteps.join('\n• ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    navigate('/start-a-project', {
      state: {
        projectBrief: {
          projectType: mappedType,
          projectName: brief.projectTitle || '',
          problem: brief.problemSummary || '',
          problemRequirement: brief.problemSummary || '',
          features: featuresList,
          featuresNeeded: featuresList.join(', '),
          techPreference: techList,
          timeline: '',
          budget: '',
          additionalRequirements: additionalNotes,
        },
      },
    });
  };

  return (
    <div className="ai-assistant-page">
      <Container size="default">
        {/* Navigation Breadcrumb */}
        <nav className="ai-assistant-nav" aria-label="Breadcrumb navigation">
          <Link to="/project-assistant" className="ai-assistant-nav__back-link">
            <span className="ai-assistant-nav__arrow" aria-hidden="true">←</span>
            <span>Guided Project Assistant</span>
          </Link>
        </nav>

        {/* Hero Section */}
        <header className="ai-assistant-hero">
          <div className="ai-assistant-hero__badge badge font-mono">
            <span className="ai-assistant-hero__badge-dot" aria-hidden="true" />
            <span>AI PROJECT ASSISTANT</span>
          </div>

          <h1 className="ai-assistant-hero__heading">
            Bring Me the Idea.
          </h1>

          <p className="ai-assistant-hero__subheading">
            Describe the software you have in mind. Gemini will help turn the idea into a clearer project brief.
          </p>

          <p className="ai-assistant-hero__supporting font-mono">
            AI-assisted planning. Final requirements should always be reviewed before development.
          </p>
        </header>

        {/* Main Content Area */}
        <div className="ai-assistant-container">
          {/* Error / Fallback State */}
          {error && (
            <div className="ai-assistant-alert" role="alert" aria-live="assertive">
              <div className="ai-assistant-alert__header">
                <span className="ai-assistant-alert__icon font-mono" aria-hidden="true">!</span>
                <span className="ai-assistant-alert__title font-bold">Notice</span>
              </div>
              <p className="ai-assistant-alert__message">{error}</p>
              <div className="ai-assistant-alert__actions">
                <Link to="/project-assistant" className="ai-assistant-alert__link font-mono">
                  Use the Guided Project Assistant instead →
                </Link>
              </div>
            </div>
          )}

          {/* Initial Input Flow (when no brief generated yet) */}
          {!brief && (
            <div className="ai-assistant-chat-panel">
              <div className="ai-assistant-greeting">
                <div className="ai-assistant-avatar" aria-hidden="true">
                  <span className="ai-assistant-avatar__text font-mono">AI</span>
                </div>
                <div className="ai-assistant-bubble">
                  <p>
                    Tell me what you're trying to build. Start with the problem, even if the idea is rough.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAnalyze} className="ai-assistant-form">
                <div className="ai-assistant-form__group">
                  <label htmlFor="project-idea-input" className="ai-assistant-form__label font-mono">
                    YOUR PROJECT IDEA:
                  </label>
                  <textarea
                    id="project-idea-input"
                    className="ai-assistant-textarea"
                    rows={6}
                    maxLength={4000}
                    placeholder="Example: I want a hotel booking system where customers can check room availability and admins can manage bookings."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                    aria-describedby="char-count"
                    required
                  />
                  <div className="ai-assistant-form__meta">
                    <span id="char-count" className="ai-assistant-char-count font-mono">
                      {message.length} / 4000 characters
                    </span>
                  </div>
                </div>

                <div className="ai-assistant-form__actions">
                  <button
                    type="submit"
                    className="ai-assistant-btn ai-assistant-btn--primary"
                    disabled={isLoading || !message.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="ai-assistant-spinner" aria-hidden="true" />
                        <span>Analyzing your idea...</span>
                      </>
                    ) : (
                      <span>Analyze My Idea →</span>
                    )}
                  </button>
                  <Link to="/project-assistant" className="ai-assistant-btn ai-assistant-btn--ghost">
                    Use Guided Step-by-Step Instead
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* Result / Refinement Flow (when brief is generated) */}
          {brief && (
            <div className="ai-assistant-result" aria-live="polite">
              {/* Top Action Bar */}
              <div className="ai-assistant-result__topbar">
                <span className="ai-assistant-result__badge font-mono">
                  GENERATED PROJECT BRIEF
                </span>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="ai-assistant-btn-text font-mono"
                >
                  Start Over ↺
                </button>
              </div>

              {/* Structured Brief Card */}
              <div className="ai-brief-card">
                <div className="ai-brief-card__header">
                  <div className="ai-brief-card__meta">
                    <span className="ai-brief-card__type font-mono">{brief.projectType}</span>
                  </div>
                  <h2 className="ai-brief-card__title">{brief.projectTitle}</h2>
                </div>

                {/* Problem Summary */}
                <div className="ai-brief-card__section">
                  <h3 className="ai-brief-card__section-title font-mono">
                    PROBLEM SUMMARY
                  </h3>
                  <p className="ai-brief-card__text">{brief.problemSummary}</p>
                </div>

                {/* Suggested Scope */}
                {brief.suggestedScope && (
                  <div className="ai-brief-card__section">
                    <h3 className="ai-brief-card__section-title font-mono">
                      SUGGESTED SCOPE
                    </h3>
                    <p className="ai-brief-card__text">{brief.suggestedScope}</p>
                  </div>
                )}

                {/* Core Features with User Requirement vs AI Suggestion Labels */}
                <div className="ai-brief-card__section">
                  <h3 className="ai-brief-card__section-title font-mono">
                    CORE FEATURES
                  </h3>
                  <div className="ai-brief-features-list">
                    {brief.coreFeatures?.map((feature, idx) => (
                      <div key={idx} className="ai-brief-feature-item">
                        <div className="ai-brief-feature-item__top">
                          <span className="ai-brief-feature-item__name font-bold">
                            {feature.title}
                          </span>
                          <span
                            className={`ai-tag font-mono ${
                              feature.tag === 'CONFIRMED FROM YOUR IDEA'
                                ? 'ai-tag--confirmed'
                                : 'ai-tag--suggestion'
                            }`}
                          >
                            {feature.tag}
                          </span>
                        </div>
                        {feature.description && (
                          <p className="ai-brief-feature-item__desc">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Stack */}
                {brief.recommendedStack && brief.recommendedStack.length > 0 && (
                  <div className="ai-brief-card__section">
                    <h3 className="ai-brief-card__section-title font-mono">
                      RECOMMENDED STACK
                    </h3>
                    <div className="ai-brief-stack-grid">
                      {brief.recommendedStack.map((tech, idx) => (
                        <div key={idx} className="ai-brief-stack-item">
                          <div className="ai-brief-stack-item__main">
                            <span className="ai-brief-stack-item__name font-bold">
                              {tech.name}
                            </span>
                            <span className="ai-brief-stack-item__role font-mono">
                              {tech.role}
                            </span>
                          </div>
                          <span className="ai-tag ai-tag--suggestion font-mono">
                            AI SUGGESTION
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions to Clarify */}
                {brief.questionsToClarify && brief.questionsToClarify.length > 0 && (
                  <div className="ai-brief-card__section ai-brief-card__section--clarify">
                    <div className="ai-brief-card__section-head">
                      <h3 className="ai-brief-card__section-title font-mono">
                        QUESTIONS TO CLARIFY
                      </h3>
                      <span className="ai-tag ai-tag--clarify font-mono">
                        NEEDS CLARIFICATION
                      </span>
                    </div>
                    <ul className="ai-brief-clarify-list">
                      {brief.questionsToClarify.map((q, idx) => (
                        <li key={idx} className="ai-brief-clarify-item">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {brief.nextSteps && brief.nextSteps.length > 0 && (
                  <div className="ai-brief-card__section">
                    <h3 className="ai-brief-card__section-title font-mono">
                      NEXT STEPS
                    </h3>
                    <ol className="ai-brief-steps-list">
                      {brief.nextSteps.map((step, idx) => (
                        <li key={idx} className="ai-brief-steps-item">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Handoff CTA inside brief card */}
                <div className="ai-brief-card__actions">
                  <button
                    type="button"
                    onClick={handleContinueToBuilder}
                    className="ai-assistant-btn ai-assistant-btn--primary ai-assistant-btn--lg"
                  >
                    <span>Continue to Project Builder →</span>
                  </button>
                </div>
              </div>

              {/* Conversational Refinement Panel */}
              <div className="ai-assistant-refine-panel">
                <h3 className="ai-assistant-refine-title">
                  Want to refine this brief?
                </h3>
                <p className="ai-assistant-refine-desc">
                  Ask Gemini to add features, adjust the scope, or modify requirements.
                </p>

                {/* Conversation History */}
                {history && history.length > 0 && (
                  <div className="ai-assistant-history" aria-label="Conversation history">
                    {history.map((msg, idx) => (
                      <div key={idx} className={`ai-history-msg ai-history-msg--${msg.role}`}>
                        <span className="ai-history-msg__role font-mono">
                          {msg.role === 'user' ? 'YOU:' : 'GEMINI:'}
                        </span>
                        <span className="ai-history-msg__text">
                          {msg.role === 'user'
                            ? msg.text
                            : `Updated requirements for "${msg.brief?.projectTitle}"`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleRefine} className="ai-assistant-refine-form">
                  <div className="ai-assistant-form__group">
                    <textarea
                      className="ai-assistant-textarea ai-assistant-textarea--sm"
                      rows={3}
                      maxLength={2000}
                      placeholder="e.g. Also include an administrative dashboard for analytics and user management."
                      value={followUpMessage}
                      onChange={(e) => setFollowUpMessage(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="ai-assistant-refine-actions">
                    <button
                      type="submit"
                      className="ai-assistant-btn ai-assistant-btn--secondary"
                      disabled={isLoading || !followUpMessage.trim()}
                    >
                      {isLoading ? (
                        <>
                          <span className="ai-assistant-spinner" aria-hidden="true" />
                          <span>Updating brief...</span>
                        </>
                      ) : (
                        <span>Update Brief →</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
