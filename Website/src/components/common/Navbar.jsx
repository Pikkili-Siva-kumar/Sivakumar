import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import Container from './Container';
import SearchModal from './SearchModal';
import { useAuth } from '../../context/useAuth';
import { NAV_ITEMS } from '../../data/navigation';
import { SITE_CONFIG } from '../../utils/constants';
import './Navbar.css';

/**
 * Professional Navbar Component
 * Floating, rounded container with desktop & mobile responsive navigation,
 * search overlay trigger, and authenticated user controls.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Close mobile menu if route changes during render without cascading effects
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

  // Prevent background scroll when mobile drawer or search is active
  useEffect(() => {
    if (mobileMenuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, searchOpen]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K for search, Escape for mobile menu)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="site-header">
        <Container size="default">
          <div className="site-navbar">
            {/* Left: Brand / Logo */}
            <NavLink to="/" className="site-navbar__brand" aria-label="Siva Kumar Home">
              <span className="site-navbar__brand-badge">
                <span className="site-navbar__brand-letters">SK</span>
                <span className="site-navbar__brand-dot" aria-hidden="true" />
              </span>
              <span className="site-navbar__brand-name">{SITE_CONFIG.name}</span>
            </NavLink>

            {/* Center: Desktop Navigation Links */}
            <nav className="site-navbar__nav" aria-label="Primary Navigation">
              <ul className="site-navbar__nav-list">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path} className="site-navbar__nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `site-navbar__nav-link ${
                          isActive ? 'site-navbar__nav-link--active' : ''
                        }`
                      }
                      end={item.path === '/'}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right: Desktop Action Group (Search + Auth) */}
            <div className="site-navbar__actions">
              <button
                type="button"
                className="site-navbar__search-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                Search
              </button>

              {isAuthenticated && user ? (
                <div className="site-navbar__user-group">
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="site-navbar__user-indicator"
                    title={`Go to ${user.role === 'admin' ? 'Admin Dashboard' : 'Client Dashboard'} (${user.email})`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <span className="site-navbar__user-avatar" aria-hidden="true">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="site-navbar__user-name">{user.name}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="site-navbar__logout-btn"
                    aria-label="Sign out"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `site-navbar__auth-link ${isActive ? 'site-navbar__auth-link--active' : ''}`
                  }
                >
                  Login
                </NavLink>
              )}
            </div>

            {/* Mobile Actions Group (Search Button + Hamburger Toggle) */}
            <div className="site-navbar__mobile-actions">
              <button
                type="button"
                className="site-navbar__mobile-search-btn"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                Search
              </button>

              <button
                type="button"
                className="site-navbar__hamburger-btn"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <span
                  className={`site-navbar__hamburger-icon ${
                    mobileMenuOpen ? 'site-navbar__hamburger-icon--open' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Navigation Drawer & Backdrop */}
        {mobileMenuOpen && (
          <div
            className="site-navbar__mobile-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={`site-navbar__mobile-drawer ${
            mobileMenuOpen ? 'site-navbar__mobile-drawer--open' : ''
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="site-navbar__mobile-drawer-header">
            <span className="site-navbar__brand-name">{SITE_CONFIG.name}</span>
            <button
              type="button"
              className="site-navbar__mobile-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="site-navbar__mobile-nav" aria-label="Mobile Navigation">
            <ul className="site-navbar__mobile-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.path} className="site-navbar__mobile-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `site-navbar__mobile-link ${
                        isActive ? 'site-navbar__mobile-link--active' : ''
                      }`
                    }
                    end={item.path === '/'}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span className="site-navbar__mobile-arrow" aria-hidden="true">→</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-navbar__mobile-footer">
            <div className="site-navbar__mobile-auth">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="site-navbar__mobile-user-info"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <span className="site-navbar__user-avatar" aria-hidden="true">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span>
                      Signed in as <strong>{user.name}</strong> ({user.role === 'admin' ? 'Admin' : 'Dashboard'})
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="site-navbar__mobile-auth-btn site-navbar__mobile-logout-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className="site-navbar__mobile-auth-btn site-navbar__mobile-login-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Overlay Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
