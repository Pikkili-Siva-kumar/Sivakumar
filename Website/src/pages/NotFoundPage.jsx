import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';

/**
 * Not Found (404) Page
 * Standard clean 404 view for undefined routes with semantic heading and navigation link.
 */
export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 — Page Not Found | Siva Kumar';
  }, []);

  return (
    <div className="page-canvas section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <Container size="default">
        <div style={{ textAlign: 'center', maxWidth: '32rem', margin: '0 auto', padding: '3rem 1rem' }}>
          <span
            className="font-mono"
            style={{
              display: 'inline-block',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--accent-primary)',
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            ERROR 404
          </span>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Page Not Found
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            The page you are looking for does not exist or may have been moved.
          </p>
          <div>
            <Link
              to="/"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Return to Home →
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
