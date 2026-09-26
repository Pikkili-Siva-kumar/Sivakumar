import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { adminAuthApi } from '../services/api';
import './AdminLayout.css';

const NAV_LINKS = [
  {
    label: 'Overview',
    path: '/admin',
    end: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    path: '/admin/projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Project Requests',
    path: '/admin/project-requests',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    path: '/admin/messages',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Services',
    path: '/admin/services',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    label: 'Users',
    path: '/admin/users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Blog',
    path: '/admin/blog',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

/**
 * Admin Layout Component
 * Provides a dedicated, secure shell for all administrative interfaces.
 * Never displays public navbar or footer.
 * Strictly verifies admin authorization.
 */
export default function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  // Close mobile drawer on route change during render
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

  // Server-side admin authorization verification
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.role === 'admin') {
      let isMounted = true;
      adminAuthApi.getProfile()
        .then((res) => {
          if (isMounted && (!res || res.role !== 'admin')) {
            setAuthFailed(true);
          }
        })
        .catch(() => {
          if (isMounted) {
            setAuthFailed(true);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isLoading, isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  // 1. Initial authentication loading state
  if (isLoading) {
    return (
      <div className="admin-shell admin-shell--loading">
        <div className="admin-loading-card">
          <div className="admin-spinner" aria-hidden="true" />
          <p className="admin-loading-text">Verifying administrative access...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated user: redirect to admin login
  if (!isAuthenticated || !user || authFailed) {
    return (
      <div className="admin-shell">
        <div className="admin-redirect-card">
          <p className="admin-loading-text">Redirecting to administrator sign in...</p>
          <Link to="/admin/login" className="admin-btn admin-btn--primary">
            Sign In to Admin
          </Link>
        </div>
      </div>
    );
  }

  // 3. Normal user (non-admin): render distinct Access Denied view
  if (user.role !== 'admin') {
    return (
      <div className="admin-shell">
        <div className="admin-denied-container">
          <div className="admin-card admin-card--denied">
            <div className="admin-icon-wrapper admin-icon-wrapper--danger" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const adminName = user.name || 'Siva Kumar';

  // 4. Authorized administrator layout
  return (
    <div className="admin-shell">
      {/* Mobile Top Bar */}
      <header className="admin-mobile-bar">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close sidebar navigation' : 'Open sidebar navigation'}
          aria-expanded={mobileMenuOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        <Link to="/admin" className="admin-mobile-brand">
          <span className="admin-brand-badge">SK</span>
          <span className="admin-mobile-title">Siva Kumar Admin</span>
        </Link>

        <div className="admin-mobile-user">
          <span className="admin-avatar-sm" aria-hidden="true">
            {adminName.charAt(0).toUpperCase()}
          </span>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar (Desktop fixed left / Mobile slide-out drawer) */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__header">
          <Link to="/admin" className="admin-brand">
            <span className="admin-brand-badge">SK</span>
            <div className="admin-brand-text">
              <span className="admin-brand-name">Siva Kumar Admin</span>
              <span className="admin-brand-status">
                <span className="admin-status-dot" aria-hidden="true" />
                Online
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav" aria-label="Admin Navigation">
          <ul className="admin-nav__list">
            {NAV_LINKS.map((item) => (
              <li key={item.path} className="admin-nav__item">
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
                  }
                >
                  <span className="admin-nav__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="admin-nav__label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar__action-btn admin-sidebar__back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar__action-btn admin-sidebar__logout-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Viewport */}
      <div className="admin-viewport">
        {/* Header with Admin Identity */}
        <header className="admin-topbar">
          <div className="admin-topbar__titles">
            <h1 className="admin-topbar__heading">Dashboard</h1>
            <p className="admin-topbar__subheading">
              Manage your website, projects, requests, and content.
            </p>
          </div>

          <div className="admin-topbar__user">
            <div className="admin-user-info">
              <span className="admin-user-name">Siva Kumar</span>
              <span className="admin-user-role">Administrator</span>
            </div>
            <div className="admin-avatar" aria-hidden="true">
              <span>SK</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
