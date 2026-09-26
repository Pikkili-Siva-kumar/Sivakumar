import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AssistantWelcome from '../components/assistant/AssistantWelcome';
import MaintenancePage from '../pages/MaintenancePage';
import { useAuth } from '../context/useAuth';
import { useSiteSettings } from '../context/useSiteSettings';
import { trackEvent } from '../utils/analytics';
import './RootLayout.css';

/**
 * Root Application Shell Layout
 * Coordinates persistent navigation header, dynamic routed page content, and footer shell.
 * Respects application-wide maintenance mode and updates SEO metadata from settings.
 */
export default function RootLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { settings } = useSiteSettings();

  useEffect(() => {
    trackEvent({
      eventType: 'page_view',
      path: location.pathname,
    });
  }, [location.pathname]);

  // Synchronize document title and description with active site settings
  useEffect(() => {
    if (settings?.seo_title) {
      document.title = settings.seo_title;
    }
    if (settings?.seo_description) {
      const metaTag = document.querySelector('meta[name="description"]');
      if (metaTag) {
        metaTag.setAttribute('content', settings.seo_description);
      }
    }
  }, [settings?.seo_title, settings?.seo_description]);

  // If maintenance mode is active, display the maintenance page to non-admins
  const isMaintenanceActive = Boolean(settings?.maintenance_mode);
  const isAdmin = user && user.role === 'admin';

  if (isMaintenanceActive && !isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <div className="app-shell">
      {/* Skip to main content link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Admin Notice Banner during active maintenance */}
      {isMaintenanceActive && isAdmin && (
        <aside
          role="status"
          style={{
            backgroundColor: '#D97706',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          ⚠️ Maintenance Mode is currently ACTIVE. Public visitors are seeing the maintenance page.
        </aside>
      )}

      {/* Global Application Header */}
      <Navbar />

      {/* Routed Page Content Viewport */}
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>

      {/* Global Application Footer */}
      <Footer />

      {/* Floating Personal Assistant Welcome & Launcher */}
      <AssistantWelcome />
    </div>
  );
}
