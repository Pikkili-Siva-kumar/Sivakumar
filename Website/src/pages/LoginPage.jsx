import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authApi } from '../services/api';
import './AuthPages.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login Page Component
 * Allows registered users to sign in with email and password.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    // Clear inline error on change
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
      const response = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response && response.token && response.user) {
        login(response.token, response.user);

        // Redirect to previous requested page (if normal route) or default home
        const destination =
          location.state?.from && !location.state.from.startsWith('/admin')
            ? location.state.from
            : '/';

        navigate(destination, { replace: true });
      } else {
        setServerError('Unexpected login response from server.');
      }
    } catch (err) {
      setServerError(
        err.message || 'Invalid email or password. Please verify your credentials and try again.'
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
            <span>Account Access</span>
          </div>
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">
            Access project discussions, requests, and updates.
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
              <label htmlFor="login-email" className="auth-label">
                Email Address <span className="auth-required">*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`auth-input ${fieldErrors.email ? 'auth-input--error' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              />
              {fieldErrors.email && (
                <span id="login-email-error" className="auth-error-message">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="auth-form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label htmlFor="login-password" className="auth-label">
                  Password <span className="auth-required">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="auth-link"
                  style={{ fontSize: 'var(--text-xs)', fontWeight: '500' }}
                >
                  Forgot your password?
                </Link>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={`auth-input ${fieldErrors.password ? 'auth-input--error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              />
              {fieldErrors.password && (
                <span id="login-password-error" className="auth-error-message">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="auth-actions">
              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <footer className="auth-footer">
            <p className="auth-footer-text">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-link">
                Create an account
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
