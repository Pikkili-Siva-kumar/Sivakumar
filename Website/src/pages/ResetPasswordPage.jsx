import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import './AuthPages.css';
import './ResetPasswordPage.css';

/**
 * ResetPasswordPage Component
 * Step 41: Secure Password Reset
 * Verifies token validity on mount, allows setting a new password, and confirms reset.
 */
export default function ResetPasswordPage() {
  const { token } = useParams();

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [formData, setFormData] = useState({
    password: '',
    confirm_password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token) {
        if (isMounted) {
          setIsVerifying(false);
          setTokenValid(false);
        }
        return;
      }

      try {
        const res = await authApi.verifyResetToken(token);
        if (isMounted) {
          if (res && res.valid) {
            setTokenValid(true);
            if (res.email) {
              setUserEmail(res.email);
            }
          } else {
            setTokenValid(false);
          }
        }
      } catch {
        if (isMounted) {
          setTokenValid(false);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    }

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

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

    if (!formData.password) {
      errors.password = 'New password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your new password.';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match.';
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
      await authApi.resetPassword({
        token,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      setIsSuccess(true);
    } catch (err) {
      setServerError(
        err.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page reset-password-page">
      <div className="auth-container">
        <header className="auth-header">
          <div className="auth-eyebrow">
            <span className="auth-eyebrow-dot" aria-hidden="true" />
            <span>ACCOUNT SECURITY</span>
          </div>
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">
            Create a strong, secure password for your account.
          </p>
        </header>

        <div className="auth-card">
          {isVerifying ? (
            <div className="reset-password-loading" aria-live="polite">
              <div className="reset-password-spinner" />
              <span className="reset-password-loading-text">VERIFYING RESET LINK...</span>
            </div>
          ) : !tokenValid ? (
            <div className="reset-password-state-box" role="alert">
              <div
                className="reset-password-icon-wrapper reset-password-icon-wrapper--error"
                aria-hidden="true"
              >
                <svg
                  className="reset-password-state-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="reset-password-state-title">Link Invalid or Expired</h2>
              <p className="reset-password-state-text">
                This password reset link is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className="auth-btn auth-btn--primary reset-password-btn-link"
              >
                Request a new link
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="reset-password-state-box" role="status">
              <div
                className="reset-password-icon-wrapper reset-password-icon-wrapper--success"
                aria-hidden="true"
              >
                <svg
                  className="reset-password-state-icon"
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
              <h2 className="reset-password-state-title">Password Reset Complete</h2>
              <p className="reset-password-state-text">
                Your password has been reset successfully.
              </p>
              <Link
                to="/login"
                className="auth-btn auth-btn--primary reset-password-btn-link"
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

              {userEmail && (
                <p
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  Resetting password for: <strong style={{ color: 'var(--text-primary)' }}>{userEmail}</strong>
                </p>
              )}

              <div className="auth-form-group">
                <label htmlFor="reset-new-password" className="auth-label">
                  New Password <span className="auth-required">*</span>
                </label>
                <input
                  id="reset-new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={`auth-input ${fieldErrors.password ? 'auth-input--error' : ''}`}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'reset-new-password-error' : undefined}
                />
                {fieldErrors.password && (
                  <span id="reset-new-password-error" className="auth-error-message">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              <div className="auth-form-group">
                <label htmlFor="reset-confirm-password" className="auth-label">
                  Confirm Password <span className="auth-required">*</span>
                </label>
                <input
                  id="reset-confirm-password"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  className={`auth-input ${fieldErrors.confirm_password ? 'auth-input--error' : ''}`}
                  placeholder="Confirm new password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.confirm_password)}
                  aria-describedby={
                    fieldErrors.confirm_password ? 'reset-confirm-password-error' : undefined
                  }
                />
                {fieldErrors.confirm_password && (
                  <span id="reset-confirm-password-error" className="auth-error-message">
                    {fieldErrors.confirm_password}
                  </span>
                )}
              </div>

              <div className="auth-actions">
                <button
                  type="submit"
                  className="auth-btn auth-btn--primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting password...' : 'Reset Password'}
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
