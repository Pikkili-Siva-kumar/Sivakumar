import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contactMessagesApi } from '../services/api';
import { useSiteSettings } from '../context/useSiteSettings';
import { trackEvent } from '../utils/analytics';
import './ContactPage.css';

/**
 * Contact Page Component
 * Direct communication channels, masked contact information, inquiry form with frontend validation, and CTA.
 */
export default function ContactPage() {
  const { settings } = useSiteSettings();
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Email format validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name, value) => {
    let error = '';
    const trimmed = value.trim();

    switch (name) {
      case 'name':
        if (!trimmed) {
          error = 'Please enter your name.';
        }
        break;
      case 'email':
        if (!trimmed) {
          error = 'Please enter your email address.';
        } else if (!emailRegex.test(trimmed)) {
          error = 'Please enter a valid email address (e.g. you@example.com).';
        }
        break;
      case 'subject':
        if (!trimmed) {
          error = 'Please enter a subject.';
        }
        break;
      case 'message':
        if (!trimmed) {
          error = 'Please enter your message.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (showSuccessMessage) {
      setShowSuccessMessage(false);
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) {
        newErrors[field] = err;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Focus first erroneous input
      const firstErrorField = Object.keys(newErrors)[0];
      const el = document.getElementById(`contact-${firstErrorField}`);
      if (el) {
        el.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await contactMessagesApi.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setShowSuccessMessage(true);
      trackEvent({
        eventType: 'contact_message_submitted',
        path: '/contact',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
      // Focus name input after scrolling
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 500);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* SECTION 1 — CONTACT HERO */}
        <header className="contact__header">
          <div className="contact__eyebrow badge badge--accent font-mono">
            <span className="contact__eyebrow-dot" aria-hidden="true" />
            <span>LET'S CONNECT</span>
          </div>

          <h1 className="contact__title">Have a project in mind?</h1>

          <p className="contact__lead">
            Whether you have a project idea, need help with a web application, or simply want to discuss an idea, feel free to reach out.
          </p>
        </header>

        {/* SECTION 2 — CONTACT CONTENT */}
        <div className="contact__body">
          <div className="contact__grid">
            {/* LEFT SIDE — CONTACT INFORMATION */}
            <aside className="contact-info" aria-labelledby="heading-contact-info">
              <div className="contact-info__card">
                <h2 id="heading-contact-info" className="contact-info__heading">
                  Get in Touch
                </h2>

                <p className="contact-info__desc">
                  I’m open to discussing projects, collaborations, development work, and practical software ideas.
                </p>

                <ul className="contact-info__list" aria-label="Direct contact methods">
                  {/* Email */}
                  <li className="contact-info__item">
                    <span className="contact-info__label font-mono">Email</span>
                    <a
                      href={`mailto:${settings?.contact_email || 'pikkilisivakumar07@gmail.com'}`}
                      className="contact-info__value contact-info__link font-mono"
                    >
                      {settings?.contact_email || 'pikkilisivakumar07@gmail.com'}
                    </a>
                  </li>

                  {/* Phone */}
                  <li className="contact-info__item">
                    <span className="contact-info__label font-mono">Phone</span>
                    <span className="contact-info__value font-mono">
                      {settings?.contact_phone || '939867XXXX'}
                    </span>
                  </li>

                  {/* LinkedIn */}
                  <li className="contact-info__item">
                    <span className="contact-info__label font-mono">LinkedIn</span>
                    <a
                      href={settings?.linkedin_url || 'https://linkedin.com/in/siva-kumar'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info__value contact-info__link font-mono"
                    >
                      {settings?.linkedin_url ? settings.linkedin_url.replace(/^https?:\/\//, '') : 'linkedin.com/in/siva-kumar'}
                    </a>
                  </li>

                  {/* GitHub */}
                  <li className="contact-info__item">
                    <span className="contact-info__label font-mono">GitHub</span>
                    <a
                      href={settings?.github_url || 'https://github.com/SivaKumarPikkili'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info__value contact-info__link font-mono"
                    >
                      {settings?.github_url ? settings.github_url.replace(/^https?:\/\//, '') : 'github.com/SivaKumarPikkili'}
                    </a>
                  </li>
                </ul>

                {/* Availability Block */}
                <div className="contact-availability" aria-label="Professional focus areas">
                  <span className="contact-availability__label font-mono">Open to</span>
                  <p className="contact-availability__text">
                    Python Full Stack • Backend Development • Web Applications • Project Work
                  </p>
                </div>

                {/* Testimonials Trust Link */}
                <div className="contact-trust-bridge" aria-label="Client & collaborator feedback link">
                  <span className="contact-trust-bridge__label font-mono">Feedback</span>
                  <Link to="/testimonials" className="contact-trust-bridge__link font-mono">
                    Read Testimonials →
                  </Link>
                </div>
              </div>
            </aside>

            {/* RIGHT SIDE — CONTACT FORM */}
            <main className="contact-form-section" aria-labelledby="heading-contact-form">
              <div ref={formRef} className="contact-form-card">
                <h2 id="heading-contact-form" className="contact-form__title">
                  Send a Message
                </h2>
                <p className="contact-form__intro">
                  Fill in your details below and I'll get back to you shortly.
                </p>

                {showSuccessMessage && (
                  <div className="contact-form__success-banner" role="status" tabIndex="-1">
                    <div className="contact-form__success-header">
                      <span className="contact-form__success-icon" aria-hidden="true">✓</span>
                      <strong className="contact-form__success-title">Message Sent</strong>
                    </div>
                    <p className="contact-form__success-text">
                      Thanks for reaching out. Your message has been received.
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="contact-form__error-banner" role="alert" tabIndex="-1">
                    <div className="contact-form__error-header">
                      <span className="contact-form__error-icon" aria-hidden="true">!</span>
                      <strong className="contact-form__error-title">Unable to send message</strong>
                    </div>
                    <p className="contact-form__error-text">{submitError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="contact-form">
                  {/* Name Field */}
                  <div className="contact-form__group">
                    <label htmlFor="contact-name" className="contact-form__label">
                      Name <span className="contact-form__required" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      aria-required="true"
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      className={`contact-form__input ${errors.name ? 'contact-form__input--error' : ''}`}
                    />
                    {errors.name && (
                      <span id="contact-name-error" className="contact-form__error-message" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="contact-form__group">
                    <label htmlFor="contact-email" className="contact-form__label">
                      Email <span className="contact-form__required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      aria-required="true"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={`contact-form__input ${errors.email ? 'contact-form__input--error' : ''}`}
                    />
                    {errors.email && (
                      <span id="contact-email-error" className="contact-form__error-message" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div className="contact-form__group">
                    <label htmlFor="contact-subject" className="contact-form__label">
                      Subject <span className="contact-form__required" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      placeholder="What would you like to build?"
                      value={formData.subject}
                      onChange={handleChange}
                      aria-required="true"
                      aria-invalid={errors.subject ? 'true' : 'false'}
                      aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                      className={`contact-form__input ${errors.subject ? 'contact-form__input--error' : ''}`}
                    />
                    {errors.subject && (
                      <span id="contact-subject-error" className="contact-form__error-message" role="alert">
                        {errors.subject}
                      </span>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="contact-form__group">
                    <label htmlFor="contact-message" className="contact-form__label">
                      Message <span className="contact-form__required" aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      placeholder="Tell me a little about your project or idea..."
                      value={formData.message}
                      onChange={handleChange}
                      aria-required="true"
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className={`contact-form__textarea ${errors.message ? 'contact-form__input--error' : ''}`}
                    />
                    {errors.message && (
                      <span id="contact-message-error" className="contact-form__error-message" role="alert">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="contact-form__actions">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="contact__btn contact__btn--primary"
                    >
                      {isSubmitting ? 'Sending Message...' : 'Send Message →'}
                    </button>
                  </div>
                </form>
              </div>
            </main>
          </div>

          {/* SECTION 3 — BOTTOM CTA */}
          <section className="contact__cta-section" aria-labelledby="heading-contact-cta">
            <div className="contact__cta-card">
              <h2 id="heading-contact-cta" className="contact__cta-title">
                Have an idea worth building?
              </h2>

              <p className="contact__cta-desc">
                Let’s turn the idea into something practical.
              </p>

              <div className="contact__cta-actions">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="contact__btn contact__btn--primary"
                >
                  Start a Project →
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
