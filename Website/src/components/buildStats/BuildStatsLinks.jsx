import React from 'react';
import { Link } from 'react-router-dom';
import './BuildStats.css';

/**
 * BuildStatsLinks Component (Section 5)
 * Architectural navigation cards linking to real modules and demonstrations.
 * Pure navigation without fake performance or vanity metrics.
 */
export default function BuildStatsLinks() {
  const links = [
    {
      title: 'Selected Work',
      path: '/work',
      desc: 'Case studies of completed systems, architecture decisions, and code structure.',
    },
    {
      title: 'Project Playground',
      path: '/playground',
      desc: 'Interactive live demonstrations of room allocation and federated learning flows.',
    },
    {
      title: 'Behind the Build',
      path: '/behind-the-build',
      desc: 'Technical breakdown of engineering decisions, state handling, and validation.',
    },
    {
      title: 'Digital Products',
      path: '/digital-products',
      desc: 'Developer utilities, checklists, and templates created from real work.',
    },
    {
      title: 'Testimonials',
      path: '/testimonials',
      desc: 'A transparent record of genuine feedback from collaborators and project clients.',
    },
  ];

  return (
    <div className="build-stats-links-grid" role="region" aria-label="Explore other areas of the work">
      {links.map((link) => (
        <Link key={link.path} to={link.path} className="build-stats-nav-card">
          <div className="build-stats-nav-card__content">
            <h3 className="build-stats-nav-card__title">
              <span>{link.title}</span>
              <span className="build-stats-nav-card__arrow" aria-hidden="true">→</span>
            </h3>
            <p className="build-stats-nav-card__desc">{link.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
