import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';
import { SITE_CONFIG } from '../../utils/constants';
import { useSiteSettings } from '../../context/useSiteSettings';
import './Footer.css';

/**
 * Minimal Global Footer Shell
 * Reflects dynamic site_name configuration with verified fallback.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSiteSettings();
  const siteName = settings?.site_name || SITE_CONFIG.name;

  return (
    <footer className="site-footer">
      <Container size="default">
        <div className="site-footer__inner">
          <p className="site-footer__copyright">
            © {currentYear} {siteName}. All rights reserved.
          </p>
          <div className="site-footer__links">
            <Link to="/privacy" className="site-footer__link">
              Privacy
            </Link>
            <Link to="/terms" className="site-footer__link">
              Terms
            </Link>
            <Link to="/build-stats" className="site-footer__link font-mono">
              Build Stats
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
