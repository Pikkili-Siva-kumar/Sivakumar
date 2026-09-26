import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import './AuthPages.css';
import './ForgotPasswordPage.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ForgotPasswordPage Component
 * Step 41: Secure Password Reset
 * Submits email for password reset instructions with anti-enumeration protection.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (fieldError) {
      setFieldError('');
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Email address is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setFieldError('Please enter a valid email address.');
      return false;
    }
    setFieldError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      // Always show generic success state regardless of whether the email exists
      setIsSubmitted(true);
    } catch (err) {
      // If network error or rate limit
      if (err.status === 429) {
        setServerError('Too many reset requests. Please wait a few minutes before trying again.');
      } else if (err.status === 400 && err.message) {
        setServerError(err.message);
      } else {
        // Generic fallback to prevent enumeration
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page forgot-password-page">
      <div className="auth-container">
        <header className="auth-header">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-dot" aria-hidden="true" />
            <span>ACCOUNT</span>
          </div>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-subtitle">
            Enter your email address and we&apos;ll send you a secure password reset link.
          </p>
        </header>

        <div className="auth-card">
          {serverError && (
            <div className="auth-alert auth-alert--error" role="alert">
              <svg
                className="auth-alert-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="forgot-password-success-box" role="status">
              <div className="forgot-password-icon-wrapper" aria-hidden="true">
                <svg
                  className="forgot-password-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="forgot-password-success-title">Check your inbox</h2>
              <p className="forgot-password-success-text">
                If an account exists for that email, a password reset link has been sent.
              </p>
              <Link to="/login" className="forgot-password-back-link">
                &larr; Back to Sign In
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-form-group">
                <label htmlFor="forgot-email" className="auth-label">
                  Email Address <span className="auth-required">*</span>
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`auth-input ${fieldError ? 'auth-input--error' : ''}`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? 'forgot-email-error' : undefined}
                />
                {fieldError && (
                  <span id="forgot-email-error" className="auth-error-message">
                    {fieldError}
                  </span>
                )}
              </div>

              <div className="auth-actions">
                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>

              <footer className="auth-footer">
                <p className="auth-footer-text">
                  Remember your password?{' '}
                  <Link to="/login" className="auth-link">
                    Back to Sign In
                  </Link>
                </p>
              </footer>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
