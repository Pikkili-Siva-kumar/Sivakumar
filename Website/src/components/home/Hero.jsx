import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../common/Container';
import profileImg from '../../assets/profile.jpg';
import './Hero.css';

/**
 * Homepage Hero Section
 * Premium, balanced personal-brand introduction featuring Pikkili Siva Kumar.
 */
export default function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <Container size="default">
        <div className="hero__grid">
          {/* Left Column: Editorial Introduction & CTAs */}
          <div className="hero__content">
            {/* 1. Eyebrow */}
            <div className="hero__eyebrow badge badge--accent">
              <span className="hero__eyebrow-dot" aria-hidden="true" />
              <span>HELLO, I'M SIVA KUMAR</span>
            </div>

            {/* 2. Main Heading */}
            <h1 id="hero-heading" className="hero__heading">
              Pikkili Siva Kumar.
            </h1>

            {/* 3. Professional Title */}
            <p className="hero__title">
              Python Full Stack Developer
            </p>

            {/* 4. Supporting Text */}
            <p className="hero__description">
              I build practical web applications and backend systems using Python, Flask, SQL, and JavaScript.
            </p>

            {/* 5. CTA Buttons */}
            <div className="hero__actions">
              <Link to="/work" className="hero__btn hero__btn--primary">
                View My Work →
              </Link>
              <Link to="/contact" className="hero__btn hero__btn--secondary">
                Start a Project
              </Link>
            </div>
          </div>

          {/* Right Column: Original Profile Portrait in Single Clean Frame */}
          <div className="hero__media">
            <div className="hero__image-frame">
              <img
                src={profileImg}
                alt="Portrait of Pikkili Siva Kumar, Python Full Stack Developer"
                className="hero__image"
                width="512"
                height="512"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
