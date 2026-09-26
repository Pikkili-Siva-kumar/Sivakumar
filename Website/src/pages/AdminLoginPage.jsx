import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { adminAuthApi } from '../services/api';
import './AdminPages.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Admin Login Page Component
 * Dedicated authentication portal for portfolio administrators.
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated as admin, redirect directly to /admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
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
      const response = await adminAuthApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response && response.token && response.user) {
        login(response.token, response.user);
        navigate('/admin', { replace: true });
      } else {
        setServerError('Unexpected response received from administration gateway.');
      }
    } catch (err) {
      // Handles 403 Forbidden ("Access denied. Administrator privileges required.")
      // and 401 Unauthorized ("Invalid email or password.")
      setServerError(
        err.message || 'Invalid administrator credentials. Access restricted.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-badge">
            <span className="admin-badge-dot" aria-hidden="true" />
            <span>Restricted Gateway</span>
          </div>
          <h1 className="admin-title">Admin Access</h1>
          <p className="admin-subtitle">
            Sign in with administrator credentials to manage portfolio content.
          </p>
        </header>

        <div className="admin-card">
          {serverError && (
            <div className="admin-alert admin-alert--error" role="alert">
              <svg
                className="admin-alert-icon"
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

          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-form-group">
              <label htmlFor="admin-email" className="admin-label">
                Email Address <span className="admin-required">*</span>
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`admin-input ${fieldErrors.email ? 'admin-input--error' : ''}`}
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="admin-email-error" className="admin-error-message">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password" className="admin-label">
                Password <span className="admin-required">*</span>
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`admin-input ${fieldErrors.password ? 'admin-input--error' : ''}`}
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
              />
              {fieldErrors.password && (
                <span id="admin-password-error" className="admin-error-message">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="admin-actions">
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Admin Sign In →'}
              </button>
            </div>
          </form>

          <footer className="admin-footer">
            <Link to="/" className="admin-link admin-back-link">
              ← Back to Website
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
