import React, { useState, useEffect, useCallback } from 'react';
import { adminMessagesApi } from '../../services/api';
import './AdminMessages.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_LABELS = {
  new: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};

function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal
  const [viewingMessage, setViewingMessage] = useState(null);

  // Delete Modal
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status update loading state
  const [updatingId, setUpdatingId] = useState(null);

  const reloadMessages = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminMessagesApi.getAll(params);
      if (res && res.messages) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load contact messages.');
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    adminMessagesApi
      .getAll(params)
      .then((res) => {
        if (isMounted) {
          if (res && res.messages) {
            setMessages(res.messages);
          } else {
            setMessages([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load contact messages.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, searchQuery]);

  // Handle open detail view and auto-mark 'new' as 'read'
  const handleOpenDetail = async (msg) => {
    setViewingMessage(msg);

    // If message is new, automatically transition to read in database
    if (msg.status === 'new') {
      try {
        await adminMessagesApi.update(msg.id, { status: 'read' });
        // Update local detail view
        setViewingMessage((prev) => (prev && prev.id === msg.id ? { ...prev, status: 'read' } : prev));
        // Update local list
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m))
        );
      } catch {
        // Non-blocking background status sync failure
      }
    }
  };

  // Handle direct status change
  const handleUpdateStatus = async (msgId, newStatus) => {
    setUpdatingId(msgId);
    try {
      await adminMessagesApi.update(msgId, { status: newStatus });
      setSuccessMessage(`Message #${msgId} marked as ${STATUS_LABELS[newStatus] || newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 4000);

      // Update in modal if currently viewing
      if (viewingMessage && viewingMessage.id === msgId) {
        setViewingMessage((prev) => ({ ...prev, status: newStatus }));
      }

      // Update in list
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      setError(err.message || 'Failed to update message status.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle open delete modal
  const handleOpenDelete = (msg) => {
    setDeletingMessage(msg);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingMessage) return;

    setIsDeleting(true);
    try {
      await adminMessagesApi.delete(deletingMessage.id);
      setSuccessMessage(`Message #${deletingMessage.id} deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);

      if (viewingMessage && viewingMessage.id === deletingMessage.id) {
        setViewingMessage(null);
      }

      setDeletingMessage(null);
      reloadMessages();
    } catch (err) {
      setError(err.message || 'Failed to delete message.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
  };

  return (
    <div className="admin-messages-page">
      {/* Header */}
      <header className="admin-messages__header">
        <div className="admin-messages__header-text">
          <h1 className="admin-messages__title">Messages</h1>
          <p className="admin-messages__subtitle">
            Manage messages submitted through the website.
          </p>
        </div>
        <div className="admin-messages__header-actions">
          <span className="admin-messages__count-badge font-mono">
            {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
          </span>
          <button
            type="button"
            onClick={reloadMessages}
            className="admin-refresh-btn"
            title="Refresh messages list"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {/* Global Alerts */}
      {successMessage && (
        <div className="admin-messages-alert admin-messages-alert--success" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="admin-messages-alert admin-messages-alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="admin-messages-filters" aria-label="Filters">
        <div className="admin-filter-search">
          <span className="admin-filter-search__icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="admin-filter-search__input"
            placeholder="Search by name, email, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-filter-status">
          <select
            className="admin-filter-status__select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {(statusFilter || searchQuery) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="admin-filter-clear-btn"
          >
            Clear Filters
          </button>
        )}
      </section>

      {/* Main Content Area */}
      {loading ? (
        <div className="admin-messages-loading">
          <p className="font-mono">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="admin-messages-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h2 className="admin-messages-empty-title">
            {statusFilter || searchQuery ? 'No matching messages found' : 'No contact messages yet'}
          </h2>
          <p className="admin-messages-empty-desc">
            {statusFilter || searchQuery
              ? 'Try adjusting your search criteria or clearing active filters.'
              : 'Messages submitted through the public Contact page will appear here.'}
          </p>
          {(statusFilter || searchQuery) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="admin-action-btn admin-action-btn--status"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Contact Messages Table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th className="admin-table__actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={msg.status === 'new' ? 'admin-table-row--unread' : ''}
                  >
                    <td>
                      <div className="admin-sender-cell">
                        <span className="admin-sender-cell__name">{msg.name}</span>
                        <span className="admin-sender-cell__email">{msg.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-subject-cell" title={msg.subject}>
                        {msg.subject}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-msg-status-badge admin-msg-status-badge--${msg.status}`}>
                        <span className="admin-msg-status-badge-dot" aria-hidden="true" />
                        {STATUS_LABELS[msg.status] || msg.status}
                      </span>
                    </td>
                    <td>
                      <span className="admin-table-date">{formatDate(msg.created_at)}</span>
                    </td>
                    <td className="admin-table__actions-col">
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(msg)}
                          className="admin-action-btn admin-action-btn--view"
                          title="Read full message"
                        >
                          View
                        </button>
                        {msg.status === 'new' && (
                          <button
                            type="button"
                            disabled={updatingId === msg.id}
                            onClick={() => handleUpdateStatus(msg.id, 'read')}
                            className="admin-action-btn admin-action-btn--status"
                            title="Mark as Read"
                          >
                            Mark Read
                          </button>
                        )}
                        {msg.status !== 'replied' && (
                          <button
                            type="button"
                            disabled={updatingId === msg.id}
                            onClick={() => handleUpdateStatus(msg.id, 'replied')}
                            className="admin-action-btn admin-action-btn--replied"
                            title="Mark as Replied"
                          >
                            Mark Replied
                          </button>
                        )}
                        {msg.status !== 'archived' && (
                          <button
                            type="button"
                            disabled={updatingId === msg.id}
                            onClick={() => handleUpdateStatus(msg.id, 'archived')}
                            className="admin-action-btn admin-action-btn--archive"
                            title="Archive message"
                          >
                            Archive
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(msg)}
                          className="admin-action-btn admin-action-btn--delete"
                          title="Delete this message"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="admin-mobile-cards">
            {messages.map((msg) => (
              <div key={msg.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <h2 className="admin-mobile-card__name">{msg.name}</h2>
                    <span className="admin-mobile-card__email">{msg.email}</span>
                  </div>
                  <span className={`admin-msg-status-badge admin-msg-status-badge--${msg.status}`}>
                    <span className="admin-msg-status-badge-dot" aria-hidden="true" />
                    {STATUS_LABELS[msg.status] || msg.status}
                  </span>
                </div>

                <div className="admin-mobile-card__subject font-medium">
                  {msg.subject}
                </div>

                <div className="admin-mobile-card__meta">
                  <span className="admin-table-date">{formatDate(msg.created_at)}</span>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(msg)}
                    className="admin-action-btn admin-action-btn--view"
                  >
                    View
                  </button>
                  {msg.status === 'new' && (
                    <button
                      type="button"
                      disabled={updatingId === msg.id}
                      onClick={() => handleUpdateStatus(msg.id, 'read')}
                      className="admin-action-btn admin-action-btn--status"
                    >
                      Mark Read
                    </button>
                  )}
                  {msg.status !== 'replied' && (
                    <button
                      type="button"
                      disabled={updatingId === msg.id}
                      onClick={() => handleUpdateStatus(msg.id, 'replied')}
                      className="admin-action-btn admin-action-btn--replied"
                    >
                      Mark Replied
                    </button>
                  )}
                  {msg.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={updatingId === msg.id}
                      onClick={() => handleUpdateStatus(msg.id, 'archived')}
                      className="admin-action-btn admin-action-btn--archive"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(msg)}
                    className="admin-action-btn admin-action-btn--delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* DETAIL VIEW MODAL */}
      {viewingMessage && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setViewingMessage(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="msg-detail-modal-title"
        >
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="msg-detail-modal-title" className="admin-modal-title">
                    Message #{viewingMessage.id}
                  </h2>
                  <p className="admin-modal-subtitle">
                    Received on {formatDate(viewingMessage.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMessage(null)}
                  className="admin-modal-close-btn"
                  aria-label="Close message"
                >
                  ×
                </button>
              </div>

              <div className="admin-detail-grid">
                {/* Contact Meta Box */}
                <div className="admin-detail-meta-box">
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Sender Name</span>
                    <span className="admin-detail-val">{viewingMessage.name}</span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Email Address</span>
                    <a
                      href={`mailto:${viewingMessage.email}?subject=Re: ${encodeURIComponent(viewingMessage.subject)}`}
                      className="admin-detail-val"
                      style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}
                    >
                      {viewingMessage.email}
                    </a>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Status</span>
                    <span className={`admin-msg-status-badge admin-msg-status-badge--${viewingMessage.status}`}>
                      <span className="admin-msg-status-badge-dot" aria-hidden="true" />
                      {STATUS_LABELS[viewingMessage.status] || viewingMessage.status}
                    </span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Received Date</span>
                    <span className="admin-detail-val">{formatDate(viewingMessage.created_at)}</span>
                  </div>
                </div>

                {/* Subject Block */}
                <div className="admin-detail-block">
                  <h3 className="admin-detail-block__title">Subject</h3>
                  <div className="admin-detail-block__content font-bold">
                    {viewingMessage.subject}
                  </div>
                </div>

                {/* Message Content Block */}
                <div className="admin-detail-block">
                  <h3 className="admin-detail-block__title">Message Body</h3>
                  <div className="admin-detail-block__content">
                    {viewingMessage.message}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="admin-modal-footer">
                <div className="admin-modal-footer__status-actions">
                  {viewingMessage.status !== 'read' && (
                    <button
                      type="button"
                      disabled={updatingId === viewingMessage.id}
                      onClick={() => handleUpdateStatus(viewingMessage.id, 'read')}
                      className="admin-action-btn admin-action-btn--status"
                    >
                      Mark as Read
                    </button>
                  )}
                  {viewingMessage.status !== 'replied' && (
                    <button
                      type="button"
                      disabled={updatingId === viewingMessage.id}
                      onClick={() => handleUpdateStatus(viewingMessage.id, 'replied')}
                      className="admin-action-btn admin-action-btn--replied"
                    >
                      Mark as Replied
                    </button>
                  )}
                  {viewingMessage.status !== 'archived' && (
                    <button
                      type="button"
                      disabled={updatingId === viewingMessage.id}
                      onClick={() => handleUpdateStatus(viewingMessage.id, 'archived')}
                      className="admin-action-btn admin-action-btn--archive"
                    >
                      Archive
                    </button>
                  )}
                </div>

                <div className="admin-modal-footer__close-actions">
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(viewingMessage)}
                    className="admin-action-btn admin-action-btn--delete"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingMessage(null)}
                    className="admin-action-btn admin-action-btn--view"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingMessage && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isDeleting && setDeletingMessage(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-msg-modal-title"
        >
          <div className="admin-modal-container admin-modal-container--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="delete-msg-modal-title" className="admin-modal-title">
                    Delete this message?
                  </h2>
                  <p className="admin-modal-subtitle">
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingMessage(null)}
                  className="admin-modal-close-btn"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-4)' }}>
                Are you sure you want to permanently delete the message from <strong>{deletingMessage.name}</strong> ({deletingMessage.email}) regarding <strong>"{deletingMessage.subject}"</strong>?
              </p>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingMessage(null)}
                  className="admin-action-btn admin-action-btn--view"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="admin-action-btn admin-action-btn--delete"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
