import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { clientRequestsApi } from '../../services/api';
import './ClientDashboard.css';

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export default function ClientDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingRequest, setViewingRequest] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user && user.role === 'admin')) {
      return;
    }

    let isMounted = true;
    clientRequestsApi
      .getAll()
      .then((res) => {
        if (isMounted && res && res.requests) {
          setRequests(res.requests);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Unable to load your project requests right now.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleOpenDetail = (req) => {
    setViewingRequest(req);
  };

  const handleCloseDetail = () => {
    setViewingRequest(null);
  };

  // Close modal with ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && viewingRequest) {
        handleCloseDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingRequest]);

  // Auth & Role Guards
  if (authLoading) {
    return (
      <div className="client-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Calculate real metrics
  const totalRequests = requests.length;
  const activeRequests = requests.filter((r) =>
    ['new', 'contacted', 'in_progress'].includes(r.status)
  ).length;
  const completedRequests = requests.filter((r) => r.status === 'completed').length;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="client-shell">
      {/* Mobile Topbar */}
      <div className="client-mobile-bar">
        <div>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Client Portal</span>
        </div>
        <button
          type="button"
          className="client-mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside className={`client-sidebar ${mobileMenuOpen ? 'client-sidebar--mobile-open' : ''}`}>
        <div className="client-sidebar__top">
          <div className="client-sidebar__brand">
            <span className="client-sidebar__logo">Client Portal</span>
            <span className="client-sidebar__badge">Project Workspace</span>
          </div>

          <nav className="client-sidebar__nav" aria-label="Client navigation">
            <button
              type="button"
              className="client-nav-item client-nav-item--active"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>📊</span>
              <span>Dashboard / My Requests</span>
            </button>

            <Link
              to="/start-a-project"
              className="client-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>🚀</span>
              <span>Start a Project</span>
            </Link>

            <Link
              to="/"
              className="client-nav-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>🌐</span>
              <span>Back to Website</span>
            </Link>
          </nav>
        </div>

        <div className="client-sidebar__bottom">
          <div className="client-user-info">
            <span className="client-user-avatar" aria-hidden="true">
              {userInitial}
            </span>
            <div className="client-user-details">
              <span className="client-user-name">{user?.name}</span>
              <span className="client-user-email">{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="client-nav-item"
            style={{ color: '#F87171' }}
          >
            <span>⎋</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="client-main">
        <header className="client-header">
          <h1 className="client-header__title">Welcome back, {user?.name}</h1>
          <p className="client-header__subtitle">Track your project requests and updates.</p>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              color: '#F87171',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Real Metrics Grid */}
        <section className="client-metrics-grid" aria-label="Project statistics">
          <div className="client-metric-card">
            <span className="client-metric-label">Total Requests</span>
            <span className="client-metric-value">{totalRequests}</span>
          </div>

          <div className="client-metric-card">
            <span className="client-metric-label">Active Requests</span>
            <span className="client-metric-value" style={{ color: '#FBBF24' }}>
              {activeRequests}
            </span>
          </div>

          <div className="client-metric-card">
            <span className="client-metric-label">Completed Requests</span>
            <span className="client-metric-value" style={{ color: '#34D399' }}>
              {completedRequests}
            </span>
          </div>
        </section>

        {/* My Project Requests Section */}
        <section className="client-section" aria-labelledby="section-requests">
          <div className="client-section__header">
            <h2 id="section-requests" className="client-section__title">
              My Project Requests
            </h2>
            <Link to="/start-a-project" className="client-btn-primary">
              + New Request
            </Link>
          </div>

          {isLoading ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading project requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="client-empty-card">
              <span style={{ fontSize: '32px' }} aria-hidden="true">
                📋
              </span>
              <h3 className="client-empty-title">No project requests yet.</h3>
              <p className="client-empty-desc">Tell me what you'd like to build.</p>
              <Link to="/start-a-project" className="client-btn-primary" style={{ marginTop: '8px' }}>
                Start a Project →
              </Link>
            </div>
          ) : (
            <div className="client-requests-list">
              {requests.map((req) => (
                <div key={req.id} className="client-request-card">
                  <div className="client-request-card__info">
                    <div className="client-request-card__top">
                      <h3 className="client-request-name">{req.project_name}</h3>
                      <span className="client-request-type">{req.project_type}</span>
                      <span className={`client-status-badge client-status--${req.status}`}>
                        {STATUS_LABELS[req.status] || req.status}
                      </span>
                    </div>

                    <div className="client-request-meta">
                      <span>Submitted: {formatDate(req.created_at)}</span>
                      <span>Last Updated: {formatDate(req.updated_at)}</span>
                    </div>
                  </div>

                  <div className="client-request-card__actions">
                    <button
                      type="button"
                      className="client-view-btn"
                      onClick={() => handleOpenDetail(req)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Request Details Modal */}
      {viewingRequest && (
        <div
          className="client-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-request-title"
          onClick={handleCloseDetail}
        >
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="client-modal__header">
              <div className="client-modal__title-group">
                <h3 id="modal-request-title" className="client-modal__title">
                  {viewingRequest.project_name}
                </h3>
                <span className={`client-status-badge client-status--${viewingRequest.status}`}>
                  {STATUS_LABELS[viewingRequest.status] || viewingRequest.status}
                </span>
              </div>
              <button
                type="button"
                className="client-modal__close-btn"
                onClick={handleCloseDetail}
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div className="client-modal__body">
              <div className="client-detail-grid">
                <div className="client-detail-field">
                  <span className="client-detail-label">Project Type</span>
                  <span className="client-detail-value">{viewingRequest.project_type}</span>
                </div>

                <div className="client-detail-field">
                  <span className="client-detail-label">Timeline</span>
                  <span className="client-detail-value">{viewingRequest.timeline || 'Not specified'}</span>
                </div>

                <div className="client-detail-field">
                  <span className="client-detail-label">Budget Range</span>
                  <span className="client-detail-value">{viewingRequest.budget_range || 'Not specified'}</span>
                </div>

                <div className="client-detail-field">
                  <span className="client-detail-label">Preferred Contact</span>
                  <span className="client-detail-value">{viewingRequest.preferred_contact || 'Email'}</span>
                </div>

                <div className="client-detail-field">
                  <span className="client-detail-label">Submitted On</span>
                  <span className="client-detail-value">{formatDate(viewingRequest.created_at)}</span>
                </div>

                <div className="client-detail-field">
                  <span className="client-detail-label">Last Updated</span>
                  <span className="client-detail-value">{formatDate(viewingRequest.updated_at)}</span>
                </div>

                <div className="client-detail-field client-detail-field--full">
                  <span className="client-detail-label">Primary Requirement</span>
                  <div className="client-detail-value">{viewingRequest.requirement}</div>
                </div>

                {viewingRequest.features && (
                  <div className="client-detail-field client-detail-field--full">
                    <span className="client-detail-label">Key Features</span>
                    <div className="client-detail-value">{viewingRequest.features}</div>
                  </div>
                )}

                {viewingRequest.technology_preference && (
                  <div className="client-detail-field client-detail-field--full">
                    <span className="client-detail-label">Technology Preference</span>
                    <div className="client-detail-value">{viewingRequest.technology_preference}</div>
                  </div>
                )}

                {viewingRequest.additional_requirements && (
                  <div className="client-detail-field client-detail-field--full">
                    <span className="client-detail-label">Additional Requirements</span>
                    <div className="client-detail-value">{viewingRequest.additional_requirements}</div>
                  </div>
                )}

                {viewingRequest.message && (
                  <div className="client-detail-field client-detail-field--full">
                    <span className="client-detail-label">Additional Message</span>
                    <div className="client-detail-value">{viewingRequest.message}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="client-modal__footer">
              <button
                type="button"
                className="client-view-btn"
                onClick={handleCloseDetail}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
