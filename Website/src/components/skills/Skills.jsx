import React, { useEffect, useRef, useState } from 'react';
import Container from '../common/Container';
import './Skills.css';

/**
 * Technology Universe / Skills Section
 * Displays verified technical stacks: Languages, Frameworks, Databases, ML/AI, and Tools.
 */
export default function Skills() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className={`skills-section ${isVisible ? 'skills-section--visible' : ''}`}
      aria-labelledby="skills-heading"
    >
      <Container size="default">
        {/* Section Header */}
        <div className="skills__header">
          <div className="skills__marker" aria-hidden="true">
            <span className="skills__marker-dot" />
            <span className="skills__marker-line" />
          </div>

          <h2 id="skills-heading" className="skills__heading">
            Technology Universe
          </h2>

          <p className="skills__subtitle">
            The languages, frameworks, databases, and tools I use to build practical software.
          </p>
        </div>

        {/* Primary 4-Card Grid */}
        <div className="skills__grid" role="region" aria-label="Core Technical Categories">
          {/* Card 01: Languages */}
          <article className="skills__card">
            <div className="skills__card-header">
              <span className="skills__card-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </span>
              <h3 className="skills__card-title">Languages</h3>
            </div>
            <ul className="skills__tag-list" aria-label="Languages">
              {['Python', 'SQL', 'JavaScript', 'HTML', 'CSS'].map((item) => (
                <li key={item} className="skills__tag">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          {/* Card 02: Frameworks */}
          <article className="skills__card">
            <div className="skills__card-header">
              <span className="skills__card-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <h3 className="skills__card-title">Frameworks</h3>
            </div>
            <ul className="skills__tag-list" aria-label="Frameworks">
              {['Flask'].map((item) => (
                <li key={item} className="skills__tag">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          {/* Card 03: Databases */}
          <article className="skills__card">
            <div className="skills__card-header">
              <span className="skills__card-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </span>
              <h3 className="skills__card-title">Databases</h3>
            </div>
            <ul className="skills__tag-list" aria-label="Databases">
              {['MySQL', 'SQLite'].map((item) => (
                <li key={item} className="skills__tag">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          {/* Card 04: ML / AI */}
          <article className="skills__card">
            <div className="skills__card-header">
              <span className="skills__card-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <h3 className="skills__card-title">ML / AI</h3>
            </div>
            <ul className="skills__tag-list" aria-label="Machine Learning and AI">
              {['Scikit-learn', 'XGBoost'].map((item) => (
                <li key={item} className="skills__tag">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        {/* Full-Width Tools Card Below */}
        <div className="skills__tools-container">
          <article className="skills__card skills__card--tools">
            <div className="skills__card-header skills__card-header--tools">
              <span className="skills__card-icon" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </span>
              <h3 className="skills__card-title">Tools</h3>
            </div>
            <ul className="skills__tag-list skills__tag-list--tools" aria-label="Development Tools">
              {['Git', 'GitHub', 'VS Code'].map((item) => (
                <li key={item} className="skills__tag">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Container>
    </section>
  );
}
