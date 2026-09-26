import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authApi } from '../services/api';
import './AuthPages.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Register Page Component
 * Allows new users to create an account with name, email, and password.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      errors.name = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response && response.token && response.user) {
        // Automatically establish session upon registration
        login(response.token, response.user);
        navigate('/', { replace: true });
      } else {
        setServerError('Unexpected response from server.');
      }
    } catch (err) {
      setServerError(
        err.message || 'Could not complete registration. Please check your details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-dot" aria-hidden="true" />
            <span>Create Account</span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Sign up to track project requests and engage directly.
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

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form-group">
              <label htmlFor="reg-name" className="auth-label">
                Full Name <span className="auth-required">*</span>
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                className={`auth-input ${fieldErrors.name ? 'auth-input--error' : ''}`}
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
              />
              {fieldErrors.name && (
                <span id="reg-name-error" className="auth-error-message">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="reg-email" className="auth-label">
                Email Address <span className="auth-required">*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`auth-input ${fieldErrors.email ? 'auth-input--error' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="reg-email-error" className="auth-error-message">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="reg-password" className="auth-label">
                Password <span className="auth-required">*</span>
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`auth-input ${fieldErrors.password ? 'auth-input--error' : ''}`}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'reg-password-error' : undefined}
              />
              {fieldErrors.password && (
                <span id="reg-password-error" className="auth-error-message">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="reg-confirm-password" className="auth-label">
                Confirm Password <span className="auth-required">*</span>
              </label>
              <input
                id="reg-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`auth-input ${fieldErrors.confirmPassword ? 'auth-input--error' : ''}`}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={
                  fieldErrors.confirmPassword ? 'reg-confirm-password-error' : undefined
                }
              />
              {fieldErrors.confirmPassword && (
                <span id="reg-confirm-password-error" className="auth-error-message">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <div className="auth-actions">
              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <footer className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
