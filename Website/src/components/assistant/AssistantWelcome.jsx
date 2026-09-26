import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AssistantWelcome.css';

const SESSION_STORAGE_KEY = 'assistant_welcome_dismissed';

// Routes where Assistant floating UI should not be rendered
const EXCLUDED_ROUTES = [
  '/ai-project-assistant',
  '/project-assistant',
  '/dashboard',
  '/admin',
  '/admin/login',
];

export default function AssistantWelcome() {
  const location = useLocation();
  const pathname = location.pathname;

  const isExcluded =
    EXCLUDED_ROUTES.some((route) => pathname === route || pathname.startsWith('/admin')) ||
    pathname.startsWith('/dashboard');

  const isHomePage = pathname === '/';

  // Read dismissed state from sessionStorage safely
  const getIsDismissed = useCallback(() => {
    try {
      return sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }, []);

  // Welcome card is visible automatically on initial load of homepage only (if not dismissed)
  const [isOpen, setIsOpen] = useState(() => {
    if (!isHomePage) return false;
    return !getIsDismissed();
  });

  // Synchronize route change during render without cascading effects
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (!isHomePage) {
      setIsOpen(false);
    } else {
      const dismissed = getIsDismissed();
      if (!dismissed) {
        setIsOpen(true);
      }
    }
  }

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    } catch {
      // Ignore sessionStorage errors
    }
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  if (isExcluded) {
    return null;
  }

  return (
    <aside className="assistant-welcome-container" aria-label="Personal Assistant">
      {isOpen && (
        <div
          className="assistant-card"
          role="region"
          aria-label="Assistant Welcome"
        >
          <div className="assistant-card__header">
            <span className="assistant-card__title">Hi 👋 I'm Siva's Assistant</span>
            <button
              type="button"
              className="assistant-card__close-btn"
              onClick={handleDismiss}
              aria-label="Close assistant welcome"
            >
              &times;
            </button>
          </div>

          <p className="assistant-card__body">
            Have a project idea? I can help you shape it.
          </p>

          <div className="assistant-card__actions">
            <Link
              to="/ai-project-assistant"
              className="assistant-card__primary-btn"
              onClick={() => setIsOpen(false)}
            >
              Start a Conversation &rarr;
            </Link>
            <Link
              to="/project-assistant"
              className="assistant-card__secondary-link"
              onClick={() => setIsOpen(false)}
            >
              See how it works
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        className="assistant-launcher"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        aria-expanded={isOpen}
      >
        Assistant
      </button>
    </aside>
  );
}
