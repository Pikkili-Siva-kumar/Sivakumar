import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import './About.css';

/**
 * About / Who I Am Component
 * Editorial two-column introduction featuring verified educational
 * background, technical focus, and core technologies.
 */
export default function About() {
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
      id="about"
      ref={sectionRef}
      className={`about-section ${isVisible ? 'about-section--visible' : ''}`}
      aria-labelledby="about-heading"
    >
      <Container size="default">
        <div className="about__grid">
          {/* Left Column: Narrative Introduction & Working Approach */}
          <div className="about__content">
            <div className="about__heading-group">
              <h2 id="about-heading" className="about__heading">
                Who I Am
              </h2>
              <span className="about__accent-bar" aria-hidden="true" />
            </div>

            <p className="about__lead">
              I'm a Python Full Stack Developer focused on building practical web applications and reliable backend systems.
            </p>

            <p className="about__paragraph">
              My work centers around Python, Flask, SQL, database design, REST APIs, and building end-to-end web applications.
            </p>

            <p className="about__paragraph">
              I enjoy turning real-world requirements into structured, usable software and improving systems through testing, validation, and clean implementation.
            </p>

            <div className="about__actions">
              <Link to="/about/journey" className="about__link">
                <span>View My Journey</span>
                <span className="about__link-arrow" aria-hidden="true">→</span>
              </Link>
              <span className="about__actions-separator" aria-hidden="true">•</span>
              <Link to="/building" className="about__link">
                <span>See What I'm Building</span>
                <span className="about__link-arrow" aria-hidden="true">→</span>
              </Link>
              <span className="about__actions-separator" aria-hidden="true">•</span>
              <Link to="/testimonials" className="about__link">
                <span>See What People Say</span>
                <span className="about__link-arrow" aria-hidden="true">→</span>
              </Link>
              <span className="about__actions-separator" aria-hidden="true">•</span>
              <Link to="/achievements" className="about__link">
                <span>View Achievements</span>
                <span className="about__link-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Clean White Information Cards */}
          <div className="about__cards" role="region" aria-label="Professional Highlights">
            {/* Card 01: Education */}
            <article className="about__card">
              <span className="about__card-label">EDUCATION</span>
              <h3 className="about__card-value">MCA</h3>
              <p className="about__card-supporting">
                Rajiv Gandhi Memorial College of Engineering and Technology
              </p>
            </article>

            {/* Card 02: Focus */}
            <article className="about__card">
              <span className="about__card-label">FOCUS</span>
              <h3 className="about__card-value">Python Full Stack</h3>
              <p className="about__card-supporting">
                Backend • Web Applications • Databases
              </p>
            </article>

            {/* Card 03: Technology */}
            <article className="about__card">
              <span className="about__card-label">TECHNOLOGY</span>
              <h3 className="about__card-value">Python • Flask • SQL</h3>
              <p className="about__card-supporting">
                MySQL • SQLite • JavaScript
              </p>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
}
