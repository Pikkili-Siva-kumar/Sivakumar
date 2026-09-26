import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminProjectsApi,
  adminProjectRequestsApi,
  adminMessagesApi,
  adminServicesApi,
  adminUsersApi,
  adminBlogApi,
} from '../../services/api';
import './AdminDashboard.css';

const QUICK_ACTIONS = [
  {
    label: 'Manage Services →',
    path: '/admin/services',
    description: 'Configure and publish software service offerings.',
  },
  {
    label: 'View Project Requests →',
    path: '/admin/project-requests',
    description: 'Review inbound scopes, budgets, and client specifications.',
  },
  {
    label: 'View Messages →',
    path: '/admin/messages',
    description: 'Read and respond to direct contact form submissions.',
  },
  {
    label: 'Manage Projects →',
    path: '/admin/projects',
    description: 'Publish, modify, or archive case studies and lab experiments.',
  },
  {
    label: 'View Analytics →',
    path: '/admin/analytics',
    description: 'Inspect first-party traffic trends, page views, and visitor activity.',
  },
];

/**
 * Admin Overview Page Component
 * Main management dashboard displaying live system overview, quick actions, and activity logs.
 */
export default function AdminOverviewPage() {
  const [projectCount, setProjectCount] = useState(null);
  const [serviceCount, setServiceCount] = useState(null);
  const [requestCount, setRequestCount] = useState(null);
  const [messageCount, setMessageCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [blogCount, setBlogCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    adminProjectsApi.getAll()
      .then((res) => {
        if (isMounted && res && typeof res.count === 'number') {
          setProjectCount(res.count);
        } else if (isMounted && res && Array.isArray(res.projects)) {
          setProjectCount(res.projects.length);
        }
      })
      .catch(() => {
        if (isMounted) setProjectCount(null);
      });

    adminServicesApi.getAll()
      .then((res) => {
        if (isMounted && res && typeof res.total_count === 'number') {
          setServiceCount(res.total_count);
        } else if (isMounted && res && typeof res.count === 'number') {
          setServiceCount(res.count);
        } else if (isMounted && res && Array.isArray(res.services)) {
          setServiceCount(res.services.length);
        }
      })
      .catch(() => {
        if (isMounted) setServiceCount(null);
      });

    adminProjectRequestsApi.getAll()
      .then((res) => {
        if (isMounted && res && typeof res.total_count === 'number') {
          setRequestCount(res.total_count);
        } else if (isMounted && res && typeof res.count === 'number') {
          setRequestCount(res.count);
        } else if (isMounted && res && Array.isArray(res.project_requests)) {
          setRequestCount(res.project_requests.length);
        }
      })
      .catch(() => {
        if (isMounted) setRequestCount(null);
      });

    adminMessagesApi.getAll()
      .then((res) => {
        if (isMounted && res && typeof res.total_count === 'number') {
          setMessageCount(res.total_count);
        } else if (isMounted && res && typeof res.count === 'number') {
          setMessageCount(res.count);
        } else if (isMounted && res && Array.isArray(res.messages)) {
          setMessageCount(res.messages.length);
        }
      })
      .catch(() => {
        if (isMounted) setMessageCount(null);
      });

    adminUsersApi.getAll()
      .then((res) => {
        if (isMounted && res && typeof res.total_count === 'number') {
          setUserCount(res.total_count);
        } else if (isMounted && res && typeof res.count === 'number') {
          setUserCount(res.count);
        } else if (isMounted && res && Array.isArray(res.users)) {
          setUserCount(res.users.length);
        }
      })
      .catch(() => {
        if (isMounted) setUserCount(null);
      });

    adminBlogApi.getAll()
      .then((res) => {
        if (isMounted && res && typeof res.total_count === 'number') {
          setBlogCount(res.total_count);
        } else if (isMounted && res && typeof res.count === 'number') {
          setBlogCount(res.count);
        } else if (isMounted && res && Array.isArray(res.posts)) {
          setBlogCount(res.posts.length);
        }
      })
      .catch(() => {
        if (isMounted) setBlogCount(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const statsCards = [
    {
      title: 'Projects',
      count: projectCount !== null ? String(projectCount) : '—',
      note: 'Stored portfolio projects in MySQL',
      link: '/admin/projects',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: 'Services',
      count: serviceCount !== null ? String(serviceCount) : '—',
      note: 'Configured service offerings',
      link: '/admin/services',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    {
      title: 'Project Requests',
      count: requestCount !== null ? String(requestCount) : '—',
      note: 'Inbound client scopes',
      link: '/admin/project-requests',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      title: 'Messages',
      count: messageCount !== null ? String(messageCount) : '—',
      note: 'Direct inquiries received',
      link: '/admin/messages',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: 'Users',
      count: userCount !== null ? String(userCount) : '—',
      note: 'Registered accounts',
      link: '/admin/users',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Blog',
      count: blogCount !== null ? String(blogCount) : '—',
      note: 'Articles and notes',
      link: '/admin/blog',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="admin-overview">
      {/* Overview Stat Cards Grid */}
      <section className="admin-section" aria-labelledby="overview-cards-heading">
        <div className="admin-section__header">
          <h2 id="overview-cards-heading" className="admin-section__title">
            Platform Metrics
          </h2>
          <span className="admin-badge admin-badge--neutral">Live Sync Active</span>
        </div>

        <div className="admin-stats-grid">
          {statsCards.map((card) => (
            <Link key={card.title} to={card.link} className="admin-stat-card">
              <div className="admin-stat-card__top">
                <span className="admin-stat-card__title">{card.title}</span>
                <span className="admin-stat-card__icon" aria-hidden="true">
                  {card.icon}
                </span>
              </div>
              <div className="admin-stat-card__value">{card.count}</div>
              <div className="admin-stat-card__note">{card.note}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Two-Column Grid: Quick Actions & Recent Activity */}
      <div className="admin-dual-grid">
        {/* Quick Actions Panel */}
        <section className="admin-section" aria-labelledby="quick-actions-heading">
          <div className="admin-section__header">
            <h2 id="quick-actions-heading" className="admin-section__title">
              Quick Actions
            </h2>
          </div>

          <div className="admin-actions-list">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.label} to={action.path} className="admin-action-card">
                <div className="admin-action-card__content">
                  <span className="admin-action-card__label">{action.label}</span>
                  <p className="admin-action-card__desc">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity Panel */}
        <section className="admin-section" aria-labelledby="recent-activity-heading">
          <div className="admin-section__header">
            <h2 id="recent-activity-heading" className="admin-section__title">
              Recent Activity
            </h2>
          </div>

          <div className="admin-activity-card">
            <div className="admin-empty-state">
              <div className="admin-empty-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
              </div>
              <p className="admin-empty-title">No recent activity yet.</p>
              <p className="admin-empty-desc">
                Activity events will automatically populate as new project requests, messages, and portfolio updates occur.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
