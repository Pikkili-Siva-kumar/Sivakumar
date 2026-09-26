import React from 'react';
import { useSiteSettings } from '../context/useSiteSettings';
import './MaintenancePage.css';

/**
 * Public Maintenance Screen
 * Rendered when maintenance mode is active for non-admin visitors.
 * Strictly avoids exposing database info, technical errors, or internal paths.
 */
export default function MaintenancePage() {
  const { settings } = useSiteSettings();
  const siteName = settings?.site_name || 'Siva Kumar';

  return (
    <div className="maintenance-page" role="alert" aria-live="polite">
      <div className="maintenance-card">
        <div className="maintenance-badge">
          <span className="maintenance-dot" aria-hidden="true" />
          <span>Under Maintenance</span>
        </div>

        <h1 className="maintenance-title">Under Maintenance</h1>

        <p className="maintenance-message">
          We're making a few improvements. Please check back soon.
        </p>

        <span className="maintenance-brand">{siteName}</span>
      </div>
    </div>
  );
}
