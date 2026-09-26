import React, { useState, useEffect, useCallback } from 'react';
import { adminProjectRequestsApi } from '../../services/api';
import './AdminProjectRequests.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
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

export default function AdminProjectRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal
  const [viewingRequest, setViewingRequest] = useState(null);

  // Status / Notes Edit Modal
  const [editingRequest, setEditingRequest] = useState(null);
  const [editStatus, setEditStatus] = useState('new');
  const [editNotes, setEditNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Delete Modal
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadRequests = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminProjectRequestsApi.getAll(params);
      if (res && res.project_requests) {
        setRequests(res.project_requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project requests.');
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    adminProjectRequestsApi
      .getAll(params)
      .then((res) => {
        if (isMounted) {
          if (res && res.project_requests) {
            setRequests(res.project_requests);
          } else {
            setRequests([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load project requests.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, searchQuery]);

  // Handle open detail view
  const handleOpenDetail = (req) => {
    setViewingRequest(req);
  };

  // Handle open edit status & notes
  const handleOpenEdit = (req) => {
    setEditingRequest(req);
    setEditStatus(req.status || 'new');
    setEditNotes(req.admin_notes || '');
  };

  // Handle save status & notes
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;

    setSavingStatus(true);
    try {
      await adminProjectRequestsApi.update(editingRequest.id, {
        status: editStatus,
        admin_notes: editNotes,
      });

      setSuccessMessage(`Request #${editingRequest.id} updated successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);

      // If detail modal is also viewing this request, update it
      if (viewingRequest && viewingRequest.id === editingRequest.id) {
        setViewingRequest((prev) => ({
          ...prev,
          status: editStatus,
          admin_notes: editNotes,
        }));
      }

      setEditingRequest(null);
      reloadRequests();
    } catch (err) {
      setError(err.message || 'Failed to update request status.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSavingStatus(false);
    }
  };

  // Handle open delete modal
  const handleOpenDelete = (req) => {
    setDeletingRequest(req);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingRequest) return;

    setIsDeleting(true);
    try {
      await adminProjectRequestsApi.delete(deletingRequest.id);
      setSuccessMessage(`Request #${deletingRequest.id} deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);

      if (viewingRequest && viewingRequest.id === deletingRequest.id) {
        setViewingRequest(null);
      }

      setDeletingRequest(null);
      reloadRequests();
    } catch (err) {
      setError(err.message || 'Failed to delete request.');
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
    <div className="admin-requests-page">
      {/* Header */}
      <header className="admin-requests__header">
        <div className="admin-requests__header-text">
          <h1 className="admin-requests__title">Project Requests</h1>
          <p className="admin-requests__subtitle">
            Review and manage project inquiries submitted through the website.
          </p>
        </div>
        <div className="admin-requests__header-actions">
          <span className="admin-requests__count-badge font-mono">
            {requests.length} {requests.length === 1 ? 'Request' : 'Requests'}
          </span>
          <button
            type="button"
            onClick={reloadRequests}
            className="admin-refresh-btn"
            title="Refresh requests list"
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
        <div className="admin-requests-alert admin-requests-alert--success" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="admin-requests-alert admin-requests-alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="admin-requests-filters" aria-label="Filters">
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
            placeholder="Search by name, email, or project..."
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
        <div className="admin-requests-loading">
          <p className="font-mono">Loading project requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="admin-requests-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h2 className="admin-requests-empty-title">
            {statusFilter || searchQuery ? 'No matching requests found' : 'No project requests yet'}
          </h2>
          <p className="admin-requests-empty-desc">
            {statusFilter || searchQuery
              ? 'Try adjusting your search criteria or clearing active filters.'
              : 'Inbound project inquiries submitted via the Start a Project flow will appear here.'}
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
            <table className="admin-table" aria-label="Project Requests Table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Project Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th className="admin-table__actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="admin-requester-cell">
                        <span className="admin-requester-cell__name">{req.name}</span>
                        <span className="admin-requester-cell__email">{req.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-project-title-cell" title={req.project_name}>
                        {req.project_name}
                      </span>
                    </td>
                    <td>
                      <span className="admin-type-pill">{req.project_type || 'General'}</span>
                    </td>
                    <td>
                      <span className={`admin-req-status-badge admin-req-status-badge--${req.status}`}>
                        <span className="admin-req-status-badge-dot" aria-hidden="true" />
                        {STATUS_LABELS[req.status] || req.status}
                      </span>
                    </td>
                    <td>
                      <span className="admin-table-date">{formatDate(req.created_at)}</span>
                    </td>
                    <td className="admin-table__actions-col">
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(req)}
                          className="admin-action-btn admin-action-btn--view"
                          title="View complete inquiry details"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(req)}
                          className="admin-action-btn admin-action-btn--status"
                          title="Update status & internal notes"
                        >
                          Edit Status
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(req)}
                          className="admin-action-btn admin-action-btn--delete"
                          title="Delete this request"
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
            {requests.map((req) => (
              <div key={req.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <h2 className="admin-mobile-card__name">{req.name}</h2>
                    <span className="admin-mobile-card__email">{req.email}</span>
                  </div>
                  <span className={`admin-req-status-badge admin-req-status-badge--${req.status}`}>
                    <span className="admin-req-status-badge-dot" aria-hidden="true" />
                    {STATUS_LABELS[req.status] || req.status}
                  </span>
                </div>

                <div className="admin-mobile-card__project">
                  {req.project_name}
                </div>

                <div className="admin-mobile-card__meta">
                  <span className="admin-type-pill">{req.project_type || 'General'}</span>
                  <span className="admin-table-date">{formatDate(req.created_at)}</span>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(req)}
                    className="admin-action-btn admin-action-btn--view"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(req)}
                    className="admin-action-btn admin-action-btn--status"
                  >
                    Edit Status
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(req)}
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
      {viewingRequest && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setViewingRequest(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-modal-title"
        >
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="detail-modal-title" className="admin-modal-title">
                    Project Request #{viewingRequest.id}
                  </h2>
                  <p className="admin-modal-subtitle">
                    Submitted on {formatDate(viewingRequest.created_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingRequest(null)}
                  className="admin-modal-close-btn"
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>

              <div className="admin-detail-grid">
                {/* Contact Meta Box */}
                <div className="admin-detail-meta-box">
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Requester Name</span>
                    <span className="admin-detail-val">{viewingRequest.name}</span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Email</span>
                    <span className="admin-detail-val">{viewingRequest.email}</span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Phone</span>
                    <span className="admin-detail-val">{viewingRequest.phone || 'Not provided'}</span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Preferred Contact</span>
                    <span className="admin-detail-val">{viewingRequest.preferred_contact || 'Email'}</span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Status</span>
                    <span className={`admin-req-status-badge admin-req-status-badge--${viewingRequest.status}`}>
                      <span className="admin-req-status-badge-dot" aria-hidden="true" />
                      {STATUS_LABELS[viewingRequest.status] || viewingRequest.status}
                    </span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Project Type</span>
                    <span className="admin-detail-val">{viewingRequest.project_type}</span>
                  </div>
                </div>

                {/* Project Name */}
                <div className="admin-detail-block">
                  <h3 className="admin-detail-block__title">Project Title</h3>
                  <div className="admin-detail-block__content font-bold">
                    {viewingRequest.project_name}
                  </div>
                </div>

                {/* Scope & Budget */}
                <div className="admin-detail-meta-box">
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Timeline Preference</span>
                    <span className="admin-detail-val">{viewingRequest.timeline || 'Not specified'}</span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Budget Range</span>
                    <span className="admin-detail-val">{viewingRequest.budget_range || 'Not specified'}</span>
                  </div>
                  <div className="admin-detail-field">
                    <span className="admin-detail-label">Technology Preference</span>
                    <span className="admin-detail-val">{viewingRequest.technology_preference || 'None specified'}</span>
                  </div>
                </div>

                {/* Core Requirement */}
                <div className="admin-detail-block">
                  <h3 className="admin-detail-block__title">Core Requirement / Problem</h3>
                  <div className="admin-detail-block__content">
                    {viewingRequest.requirement}
                  </div>
                </div>

                {/* Features Needed */}
                {viewingRequest.features && (
                  <div className="admin-detail-block">
                    <h3 className="admin-detail-block__title">Features Needed</h3>
                    <div className="admin-detail-block__content">
                      {viewingRequest.features}
                    </div>
                  </div>
                )}

                {/* Additional Requirements */}
                {viewingRequest.additional_requirements && (
                  <div className="admin-detail-block">
                    <h3 className="admin-detail-block__title">Additional Requirements</h3>
                    <div className="admin-detail-block__content">
                      {viewingRequest.additional_requirements}
                    </div>
                  </div>
                )}

                {/* Message */}
                {viewingRequest.message && (
                  <div className="admin-detail-block">
                    <h3 className="admin-detail-block__title">Visitor Message</h3>
                    <div className="admin-detail-block__content">
                      {viewingRequest.message}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="admin-detail-notes">
                  <div className="admin-detail-notes__header">
                    <span className="admin-detail-notes__title">Internal Admin Notes</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenEdit(viewingRequest);
                      }}
                      className="admin-action-btn admin-action-btn--status"
                      style={{ padding: '0.2rem 0.5rem', fontSize: '11px' }}
                    >
                      Edit Notes
                    </button>
                  </div>
                  <p className="admin-detail-notes__text">
                    {viewingRequest.admin_notes || 'No internal notes added yet.'}
                  </p>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setViewingRequest(null)}
                  className="admin-action-btn admin-action-btn--view"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(viewingRequest);
                  }}
                  className="admin-action-btn admin-action-btn--status"
                >
                  Edit Status & Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STATUS & NOTES MODAL */}
      {editingRequest && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !savingStatus && setEditingRequest(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-status-modal-title"
        >
          <div className="admin-modal-container admin-modal-container--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="edit-status-modal-title" className="admin-modal-title">
                    Update Request Status
                  </h2>
                  <p className="admin-modal-subtitle">
                    Request #{editingRequest.id} — {editingRequest.name}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingStatus}
                  onClick={() => setEditingRequest(null)}
                  className="admin-modal-close-btn"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveStatus} className="admin-req-form">
                <div className="admin-req-form-group">
                  <label htmlFor="req-status-select" className="admin-req-label">
                    Status
                  </label>
                  <select
                    id="req-status-select"
                    className="admin-req-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    disabled={savingStatus}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="admin-req-form-group">
                  <label htmlFor="req-admin-notes" className="admin-req-label">
                    Admin Notes (Internal)
                  </label>
                  <textarea
                    id="req-admin-notes"
                    className="admin-req-textarea"
                    placeholder="Add private follow-up notes, discussion summary, or next steps..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    disabled={savingStatus}
                  />
                  <span className="admin-req-hint">
                    These notes are only visible to the admin team and never shown to visitors.
                  </span>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    disabled={savingStatus}
                    onClick={() => setEditingRequest(null)}
                    className="admin-action-btn admin-action-btn--view"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStatus}
                    className="admin-action-btn admin-action-btn--status"
                  >
                    {savingStatus ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRequest && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isDeleting && setDeletingRequest(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="admin-modal-container admin-modal-container--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="delete-modal-title" className="admin-modal-title">
                    Delete this request?
                  </h2>
                  <p className="admin-modal-subtitle">
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingRequest(null)}
                  className="admin-modal-close-btn"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-4)' }}>
                Are you sure you want to permanently delete the inquiry for <strong>{deletingRequest.project_name}</strong> submitted by <strong>{deletingRequest.name}</strong> ({deletingRequest.email})?
              </p>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingRequest(null)}
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
                  {isDeleting ? 'Deleting...' : 'Delete Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
