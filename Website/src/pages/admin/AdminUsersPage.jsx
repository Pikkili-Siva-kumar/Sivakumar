import React, { useState, useEffect, useCallback } from 'react';
import { adminUsersApi } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import './AdminUsers.css';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

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

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
}

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [viewingUser, setViewingUser] = useState(null);
  const [statusConfirmUser, setStatusConfirmUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Action in-flight state
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminUsersApi.getAll(params);
      if (res && Array.isArray(res.users)) {
        setUsers(res.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    }
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;

    adminUsersApi
      .getAll(params)
      .then((res) => {
        if (isMounted) {
          if (res && Array.isArray(res.users)) {
            setUsers(res.users);
          } else {
            setUsers([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load users.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, roleFilter, statusFilter]);

  // Handle status toggle (activate / deactivate)
  const handleConfirmToggleStatus = async () => {
    if (!statusConfirmUser) return;
    setIsProcessing(true);
    setError('');

    const newActiveState = !statusConfirmUser.is_active;

    try {
      const res = await adminUsersApi.update(statusConfirmUser.id, {
        is_active: newActiveState,
      });

      setSuccessMessage(
        res.message ||
          (newActiveState
            ? `User "${statusConfirmUser.name}" has been activated.`
            : `User "${statusConfirmUser.name}" has been deactivated.`)
      );

      setStatusConfirmUser(null);
      if (viewingUser && viewingUser.id === statusConfirmUser.id) {
        setViewingUser((prev) => (prev ? { ...prev, is_active: newActiveState } : null));
      }

      await fetchUsers();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle user deletion
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsProcessing(true);
    setError('');

    try {
      const res = await adminUsersApi.delete(deletingUser.id);
      setSuccessMessage(res.message || `User "${deletingUser.name}" deleted successfully.`);
      setDeletingUser(null);
      if (viewingUser && viewingUser.id === deletingUser.id) {
        setViewingUser(null);
      }
      await fetchUsers();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = Boolean(searchQuery.trim() || roleFilter || statusFilter);

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="admin-users__header">
        <div className="admin-users__header-text">
          <h1 className="admin-users__title">Users</h1>
          <p className="admin-users__subtitle">Manage registered users and account access.</p>
        </div>

        <div className="admin-users__header-actions">
          <span className="admin-users__count-badge">
            {users.length} {users.length === 1 ? 'Account' : 'Accounts'}
          </span>
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => {
              setLoading(true);
              fetchUsers().finally(() => setLoading(false));
            }}
            title="Refresh users list"
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

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="admin-users-alert admin-users-alert--success" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {error && (
        <div className="admin-users-alert admin-users-alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="admin-users-filters">
        <div className="admin-filter-search">
          <svg
            className="admin-filter-search__icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-filter-search__input"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search users"
          />
        </div>

        <div className="admin-filter-select-group">
          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className="admin-filter-select"
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

        {hasActiveFilters && (
          <button
            type="button"
            className="admin-filter-clear-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="admin-users-loading">
          <div className="admin-users-loading__spinner" />
          <span className="admin-users-loading__text">Loading user accounts...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-users-empty">
          <svg
            className="admin-users-empty__icon"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="admin-users-empty__title">No users found</p>
          <p className="admin-users-empty__desc">
            {hasActiveFilters
              ? 'No registered users match your search criteria. Try adjusting or clearing your filters.'
              : 'There are currently no registered users in the database.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={handleClearFilters}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-users-table-card">
            <div className="admin-table-container">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = currentAdmin && currentAdmin.id === u.id;
                    const initials = getInitials(u.name, u.email);

                    return (
                      <tr key={u.id}>
                        {/* User Column */}
                        <td>
                          <div className="admin-user-cell">
                            <div
                              className={`admin-user-avatar ${
                                u.role === 'admin' ? 'admin-user-avatar--admin' : ''
                              }`}
                              aria-hidden="true"
                            >
                              {initials}
                            </div>
                            <div className="admin-user-info">
                              <div className="admin-user-name-wrapper">
                                <span className="admin-user-name">{u.name}</span>
                                {isSelf && <span className="admin-you-tag">You</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email Column */}
                        <td>
                          <span className="admin-user-email">{u.email}</span>
                        </td>

                        {/* Role Column */}
                        <td>
                          <span
                            className={`admin-role-badge ${
                              u.role === 'admin' ? 'admin-role-badge--admin' : 'admin-role-badge--user'
                            }`}
                          >
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td>
                          <span
                            className={`admin-user-status-badge ${
                              u.is_active
                                ? 'admin-user-status-badge--active'
                                : 'admin-user-status-badge--inactive'
                            }`}
                          >
                            <span className="admin-user-status-dot" />
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Joined Column */}
                        <td>
                          <span className="admin-table-date">{formatDate(u.created_at)}</span>
                        </td>

                        {/* Actions Column */}
                        <td>
                          <div className="admin-table__actions">
                            <button
                              type="button"
                              className="admin-btn-action"
                              onClick={() => setViewingUser(u)}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className={`admin-btn-action ${
                                u.is_active
                                  ? 'admin-btn-action--deactivate'
                                  : 'admin-btn-action--activate'
                              }`}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? 'You cannot deactivate your own admin account.'
                                  : u.is_active
                                  ? 'Deactivate this user account'
                                  : 'Activate this user account'
                              }
                              onClick={() => setStatusConfirmUser(u)}
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              className="admin-btn-action admin-btn-action--danger"
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? 'You cannot delete your own admin account.'
                                  : 'Delete this user account'
                              }
                              onClick={() => setDeletingUser(u)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="admin-users-mobile-list">
            {users.map((u) => {
              const isSelf = currentAdmin && currentAdmin.id === u.id;
              const initials = getInitials(u.name, u.email);

              return (
                <div key={u.id} className="admin-user-card">
                  <div className="admin-user-card__header">
                    <div className="admin-user-card__profile">
                      <div
                        className={`admin-user-avatar ${
                          u.role === 'admin' ? 'admin-user-avatar--admin' : ''
                        }`}
                        aria-hidden="true"
                      >
                        {initials}
                      </div>
                      <div className="admin-user-card__details">
                        <h3 className="admin-user-card__name">
                          {u.name}
                          {isSelf && <span className="admin-you-tag">You</span>}
                        </h3>
                        <span className="admin-user-card__email">{u.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-user-card__meta">
                    <div className="admin-user-card__badges">
                      <span
                        className={`admin-role-badge ${
                          u.role === 'admin' ? 'admin-role-badge--admin' : 'admin-role-badge--user'
                        }`}
                      >
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                      <span
                        className={`admin-user-status-badge ${
                          u.is_active
                            ? 'admin-user-status-badge--active'
                            : 'admin-user-status-badge--inactive'
                        }`}
                      >
                        <span className="admin-user-status-dot" />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <span className="admin-table-date">Joined {formatDate(u.created_at)}</span>
                  </div>

                  <div className="admin-user-card__actions">
                    <button
                      type="button"
                      className="admin-btn-action"
                      onClick={() => setViewingUser(u)}
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className={`admin-btn-action ${
                        u.is_active
                          ? 'admin-btn-action--deactivate'
                          : 'admin-btn-action--activate'
                      }`}
                      disabled={isSelf}
                      title={
                        isSelf
                          ? 'You cannot deactivate your own admin account.'
                          : u.is_active
                          ? 'Deactivate this user account'
                          : 'Activate this user account'
                      }
                      onClick={() => setStatusConfirmUser(u)}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      className="admin-btn-action admin-btn-action--danger"
                      disabled={isSelf}
                      title={
                        isSelf
                          ? 'You cannot delete your own admin account.'
                          : 'Delete this user account'
                      }
                      onClick={() => setDeletingUser(u)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* USER DETAIL MODAL */}
      {viewingUser && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setViewingUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-detail-title"
        >
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="user-detail-title" className="admin-modal-title">
                    User Details
                  </h2>
                  <p className="admin-modal-subtitle">
                    Account profile and system access overview
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => setViewingUser(null)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <div className="admin-user-detail-profile">
                <div
                  className={`admin-user-detail-avatar ${
                    viewingUser.role === 'admin' ? 'admin-user-detail-avatar--admin' : ''
                  }`}
                  aria-hidden="true"
                >
                  {getInitials(viewingUser.name, viewingUser.email)}
                </div>
                <div className="admin-user-detail-header-text">
                  <h3 className="admin-user-detail-name">
                    {viewingUser.name}
                    {currentAdmin && currentAdmin.id === viewingUser.id && (
                      <span className="admin-you-tag" style={{ marginLeft: 'var(--space-2)' }}>
                        You
                      </span>
                    )}
                  </h3>
                  <p className="admin-user-detail-email">{viewingUser.email}</p>
                </div>
              </div>

              <div className="admin-user-detail-grid">
                <div className="admin-user-detail-item">
                  <span className="admin-user-detail-label">Role</span>
                  <span className="admin-user-detail-value">
                    <span
                      className={`admin-role-badge ${
                        viewingUser.role === 'admin'
                          ? 'admin-role-badge--admin'
                          : 'admin-role-badge--user'
                      }`}
                    >
                      {viewingUser.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </span>
                </div>

                <div className="admin-user-detail-item">
                  <span className="admin-user-detail-label">Account Status</span>
                  <span className="admin-user-detail-value">
                    <span
                      className={`admin-user-status-badge ${
                        viewingUser.is_active
                          ? 'admin-user-status-badge--active'
                          : 'admin-user-status-badge--inactive'
                      }`}
                    >
                      <span className="admin-user-status-dot" />
                      {viewingUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>

                <div className="admin-user-detail-item">
                  <span className="admin-user-detail-label">Joined Date</span>
                  <span className="admin-user-detail-value">
                    {formatDate(viewingUser.created_at)}
                  </span>
                </div>

                <div className="admin-user-detail-item">
                  <span className="admin-user-detail-label">Last Updated</span>
                  <span className="admin-user-detail-value">
                    {formatDate(viewingUser.updated_at)}
                  </span>
                </div>
              </div>

              <div className="admin-modal-actions">
                {currentAdmin && currentAdmin.id !== viewingUser.id && (
                  <button
                    type="button"
                    className={`admin-modal-btn ${
                      viewingUser.is_active
                        ? 'admin-modal-btn--warning'
                        : 'admin-modal-btn--primary'
                    }`}
                    onClick={() => {
                      setStatusConfirmUser(viewingUser);
                    }}
                  >
                    {viewingUser.is_active ? 'Deactivate User' : 'Activate User'}
                  </button>
                )}

                <button
                  type="button"
                  className="admin-modal-btn admin-modal-btn--secondary"
                  onClick={() => setViewingUser(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVATE / DEACTIVATE CONFIRMATION MODAL */}
      {statusConfirmUser && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isProcessing && setStatusConfirmUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-modal-title"
        >
          <div
            className="admin-modal-container admin-modal-container--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="status-modal-title" className="admin-modal-title">
                    {statusConfirmUser.is_active
                      ? 'Deactivate this user?'
                      : 'Activate this user?'}
                  </h2>
                  <p className="admin-modal-subtitle">
                    Account access confirmation
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => !isProcessing && setStatusConfirmUser(null)}
                  disabled={isProcessing}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <p className="admin-confirm-body">
                {statusConfirmUser.is_active
                  ? 'This user will no longer be able to authenticate.'
                  : 'This user will be able to log in again.'}
              </p>

              <p className="admin-confirm-body">
                Target account:{' '}
                <span className="admin-confirm-highlight">
                  {statusConfirmUser.name} ({statusConfirmUser.email})
                </span>
              </p>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn admin-modal-btn--secondary"
                  onClick={() => setStatusConfirmUser(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={`admin-modal-btn ${
                    statusConfirmUser.is_active
                      ? 'admin-modal-btn--warning'
                      : 'admin-modal-btn--primary'
                  }`}
                  onClick={handleConfirmToggleStatus}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? 'Updating...'
                    : statusConfirmUser.is_active
                    ? 'Deactivate'
                    : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isProcessing && setDeletingUser(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="admin-modal-container admin-modal-container--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="delete-modal-title" className="admin-modal-title">
                    Delete this user?
                  </h2>
                  <p className="admin-modal-subtitle">
                    Permanent account removal
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => !isProcessing && setDeletingUser(null)}
                  disabled={isProcessing}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <p className="admin-confirm-body">
                This action cannot be undone.
              </p>

              <p className="admin-confirm-body">
                Target account:{' '}
                <span className="admin-confirm-highlight">
                  {deletingUser.name} ({deletingUser.email})
                </span>
              </p>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn admin-modal-btn--secondary"
                  onClick={() => setDeletingUser(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-modal-btn admin-modal-btn--danger"
                  onClick={handleConfirmDelete}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
