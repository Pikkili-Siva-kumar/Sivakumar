import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './AdminPages.css';

/**
 * Admin Placeholder Page Component
 * Represents the protected /admin route.
 * Strictly verifies admin authorization.
 */
export default function AdminPlaceholderPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  // If auth status is currently verifying against backend, display loading indicator
  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-card admin-card--loading">
            <div className="admin-spinner" aria-hidden="true" />
            <p className="admin-loading-text">Verifying administrative access...</p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to admin login
  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // If authenticated as a normal user (non-admin), render distinct "Access Denied" state
  if (user.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-card admin-card--denied">
            <div className="admin-icon-wrapper admin-icon-wrapper--danger" aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <h1 className="admin-title">Access Denied</h1>
            <p className="admin-subtitle">
              Administrator privileges are required to view this area. You are currently signed in as a standard user.
            </p>
            <div className="admin-user-details">
              <span>Account: <strong>{user.email}</strong></span>
              <span className="admin-role-badge admin-role-badge--user">Role: {user.role}</span>
            </div>
            <div className="admin-actions">
              <Link to="/" className="admin-btn admin-btn--secondary">
                Return to Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated as administrator, render the requested placeholder
  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-card admin-card--success">
          <div className="admin-badge admin-badge--active">
            <span className="admin-badge-dot" aria-hidden="true" />
            <span>Administrator Session</span>
          </div>

          <div className="admin-icon-wrapper admin-icon-wrapper--success" aria-hidden="true">
            <svg
              width="32"
              height="32"
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

          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Welcome, {user.name || 'Siva Kumar'}</p>

          <div className="admin-banner-notice">
            <p className="admin-success-statement">
              Authentication successful. Dashboard modules will be added next.
            </p>
          </div>

          <div className="admin-user-details">
            <div className="admin-detail-row">
              <span className="admin-detail-label">Admin Name:</span>
              <span className="admin-detail-value">{user.name}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Admin Email:</span>
              <span className="admin-detail-value">{user.email}</span>
            </div>
            <div className="admin-detail-row">
              <span className="admin-detail-label">Permission Level:</span>
              <span className="admin-role-badge admin-role-badge--admin">Role: {user.role}</span>
            </div>
          </div>

          <div className="admin-card-actions">
            <Link to="/" className="admin-btn admin-btn--secondary">
              Back to Website
            </Link>
            <button
              type="button"
              onClick={logout}
              className="admin-btn admin-btn--outline"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
