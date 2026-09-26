import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import { PROJECTS } from '../data/projects';
import { trackEvent } from '../utils/analytics';

/**
 * CaseStudyPlaceholderPage Component
 * Temporary placeholder state for project-detail routes during Step 06.
 * Full case-study pages will be built in the next step.
 */
export default function CaseStudyPlaceholderPage() {
  const { projectId } = useParams();
  const project = PROJECTS.find((p) => p.id === projectId);

  useEffect(() => {
    trackEvent({
      eventType: 'project_view',
      path: `/work/${projectId}`,
      metadata: { slug: projectId },
    });
  }, [projectId]);

  return (
    <div className="case-study-placeholder section">
      <Container size="default">
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <Link
            to="/work"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-6)',
              textDecoration: 'none',
            }}
          >
            ← Back to Selected Work
          </Link>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <span className="badge badge--accent font-mono">CASE STUDY COMING NEXT</span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', marginBottom: 'var(--space-3)' }}>
            {project ? project.title : 'Project Case Study'}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
            {project
              ? `The comprehensive technical case study for ${project.title} will be constructed in the upcoming step.`
              : 'Detailed case study coming in the next step.'}
          </p>
        </div>
      </Container>
    </div>
  );
}
