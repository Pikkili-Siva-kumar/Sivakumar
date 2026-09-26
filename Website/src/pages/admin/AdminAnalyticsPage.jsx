import React, { useState, useEffect, useCallback } from 'react';
import { adminAnalyticsApi } from '../../services/api';
import './AdminAnalytics.css';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function AdminAnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reloadOverview = useCallback(async (range) => {
    try {
      const res = await adminAnalyticsApi.getOverview(range);
      if (res && res.status === 'ok') {
        setAnalyticsData(res);
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Failed to load analytics overview.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    adminAnalyticsApi
      .getOverview(selectedRange)
      .then((res) => {
        if (isMounted) {
          if (res && res.status === 'ok') {
            setAnalyticsData(res);
            setError('');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load analytics overview.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRange]);

  const metrics = analyticsData?.metrics || {
    page_views: 0,
    unique_sessions: 0,
    project_views: 0,
    blog_views: 0,
    project_requests: 0,
    messages: 0,
  };

  const timeSeries = analyticsData?.time_series || [];
  const topProjects = analyticsData?.top_projects || [];
  const topArticles = analyticsData?.top_articles || [];
  const topPages = analyticsData?.top_pages || [];

  // Determine if there is activity in the current time-series
  const totalPvInSeries = timeSeries.reduce((sum, d) => sum + (d.page_views || 0), 0);
  const totalProjInSeries = timeSeries.reduce((sum, d) => sum + (d.project_views || 0), 0);

  const maxPv = Math.max(...timeSeries.map((d) => d.page_views || 0), 1);
  const maxProj = Math.max(...timeSeries.map((d) => d.project_views || 0), 1);

  return (
    <div className="admin-analytics-page">
      {/* Header */}
      <div className="admin-analytics__header">
        <div className="admin-analytics__header-text">
          <h1 className="admin-analytics__title">Analytics</h1>
          <p className="admin-analytics__subtitle">
            Understand how the website is being used.
          </p>
        </div>

        <div className="admin-analytics__header-actions">
          {/* Range Controls */}
          <div className="admin-range-switcher" role="tablist" aria-label="Time range">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`admin-range-btn ${
                  selectedRange === opt.value ? 'admin-range-btn--active' : ''
                }`}
                onClick={() => setSelectedRange(opt.value)}
                role="tab"
                aria-selected={selectedRange === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => {
              setLoading(true);
              reloadOverview(selectedRange).finally(() => setLoading(false));
            }}
            title="Refresh analytics data"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-analytics-alert admin-analytics-alert--error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="admin-analytics-metrics-grid">
        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__top">
            <span className="admin-analytics-stat-card__title">Page Views</span>
            <span className="admin-analytics-stat-card__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
          </div>
          <div className="admin-analytics-stat-card__value">
            {loading ? '—' : metrics.page_views}
          </div>
          <div className="admin-analytics-stat-card__note">Public route views</div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__top">
            <span className="admin-analytics-stat-card__title">Unique Sessions</span>
            <span className="admin-analytics-stat-card__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </span>
          </div>
          <div className="admin-analytics-stat-card__value">
            {loading ? '—' : metrics.unique_sessions}
          </div>
          <div className="admin-analytics-stat-card__note">Distinct visitor sessions</div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__top">
            <span className="admin-analytics-stat-card__title">Project Views</span>
            <span className="admin-analytics-stat-card__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </span>
          </div>
          <div className="admin-analytics-stat-card__value">
            {loading ? '—' : metrics.project_views}
          </div>
          <div className="admin-analytics-stat-card__note">Case study reads</div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__top">
            <span className="admin-analytics-stat-card__title">Blog Views</span>
            <span className="admin-analytics-stat-card__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </span>
          </div>
          <div className="admin-analytics-stat-card__value">
            {loading ? '—' : metrics.blog_views}
          </div>
          <div className="admin-analytics-stat-card__note">Article reads</div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__top">
            <span className="admin-analytics-stat-card__title">Project Requests</span>
            <span className="admin-analytics-stat-card__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
          </div>
          <div className="admin-analytics-stat-card__value">
            {loading ? '—' : metrics.project_requests}
          </div>
          <div className="admin-analytics-stat-card__note">Inbound scopes submitted</div>
        </div>

        <div className="admin-analytics-stat-card">
          <div className="admin-analytics-stat-card__top">
            <span className="admin-analytics-stat-card__title">Messages</span>
            <span className="admin-analytics-stat-card__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
          </div>
          <div className="admin-analytics-stat-card__value">
            {loading ? '—' : metrics.messages}
          </div>
          <div className="admin-analytics-stat-card__note">Contact inquiries</div>
        </div>
      </div>

      {/* Restrained Activity Charts */}
      <div className="admin-analytics-charts-grid">
        {/* Page Views Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <h2 className="admin-chart-card__title">Page Views Over Time</h2>
            <span className="admin-chart-card__badge">
              {selectedRange === 'today' ? 'Today' : `Last ${selectedRange}`}
            </span>
          </div>

          {totalPvInSeries === 0 ? (
            <div className="admin-chart-empty">
              <p className="admin-chart-empty__text">Not enough activity yet</p>
              <p className="admin-chart-empty__hint">
                Activity events will render here as users navigate public pages.
              </p>
            </div>
          ) : (
            <div className="admin-bar-chart" aria-label="Page views bar chart">
              {timeSeries.map((d) => {
                const heightPercent = Math.max((d.page_views / maxPv) * 100, 4);
                const dayLabel = d.date.slice(5); // MM-DD
                return (
                  <div key={d.date} className="admin-bar-col">
                    {d.page_views > 0 && (
                      <span className="admin-bar-tooltip">{d.page_views}</span>
                    )}
                    <div className="admin-bar-track">
                      <div
                        className="admin-bar-fill"
                        style={{ height: `${heightPercent}%` }}
                        title={`${d.date}: ${d.page_views} page views`}
                      />
                    </div>
                    <span className="admin-bar-label">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Views Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <h2 className="admin-chart-card__title">Project Views Over Time</h2>
            <span className="admin-chart-card__badge">
              {selectedRange === 'today' ? 'Today' : `Last ${selectedRange}`}
            </span>
          </div>

          {totalProjInSeries === 0 ? (
            <div className="admin-chart-empty">
              <p className="admin-chart-empty__text">Not enough activity yet</p>
              <p className="admin-chart-empty__hint">
                Project views will render here as visitors explore portfolio case studies.
              </p>
            </div>
          ) : (
            <div className="admin-bar-chart" aria-label="Project views bar chart">
              {timeSeries.map((d) => {
                const heightPercent = Math.max((d.project_views / maxProj) * 100, 4);
                const dayLabel = d.date.slice(5); // MM-DD
                return (
                  <div key={d.date} className="admin-bar-col">
                    {d.project_views > 0 && (
                      <span className="admin-bar-tooltip">{d.project_views}</span>
                    )}
                    <div className="admin-bar-track">
                      <div
                        className="admin-bar-fill admin-bar-fill--alt"
                        style={{ height: `${heightPercent}%` }}
                        title={`${d.date}: ${d.project_views} project views`}
                      />
                    </div>
                    <span className="admin-bar-label">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Content Breakdown */}
      <div className="admin-top-content-grid">
        {/* Top Projects */}
        <div className="admin-top-list-card">
          <h2 className="admin-top-list-title">
            <span>Top Projects</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              By views
            </span>
          </h2>

          {topProjects.length === 0 ? (
            <p className="admin-top-empty">No project views recorded in this range.</p>
          ) : (
            <ul className="admin-top-list">
              {topProjects.map((item) => (
                <li key={item.path} className="admin-top-item">
                  <span className="admin-top-item__path" title={item.path}>
                    {item.path}
                  </span>
                  <span className="admin-top-item__badge">
                    {item.views} {item.views === 1 ? 'view' : 'views'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Articles */}
        <div className="admin-top-list-card">
          <h2 className="admin-top-list-title">
            <span>Top Articles</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              By views
            </span>
          </h2>

          {topArticles.length === 0 ? (
            <p className="admin-top-empty">No article views recorded in this range.</p>
          ) : (
            <ul className="admin-top-list">
              {topArticles.map((item) => (
                <li key={item.path} className="admin-top-item">
                  <span className="admin-top-item__path" title={item.path}>
                    {item.path}
                  </span>
                  <span className="admin-top-item__badge">
                    {item.views} {item.views === 1 ? 'view' : 'views'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Popular Pages */}
        <div className="admin-top-list-card">
          <h2 className="admin-top-list-title">
            <span>Popular Pages</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              By views
            </span>
          </h2>

          {topPages.length === 0 ? (
            <p className="admin-top-empty">No page views recorded in this range.</p>
          ) : (
            <ul className="admin-top-list">
              {topPages.map((item) => (
                <li key={item.path} className="admin-top-item">
                  <span className="admin-top-item__path" title={item.path}>
                    {item.path}
                  </span>
                  <span className="admin-top-item__badge">
                    {item.views} {item.views === 1 ? 'view' : 'views'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
