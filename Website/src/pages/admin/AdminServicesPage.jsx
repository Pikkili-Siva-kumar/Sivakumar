import React, { useState, useEffect, useCallback } from 'react';
import { adminServicesApi } from '../../services/api';
import './AdminServices.css';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const INITIAL_FORM_STATE = {
  title: '',
  slug: '',
  short_description: '',
  description: '',
  technologies: '',
  featured: false,
  status: 'published',
  display_order: 0,
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

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deletingService, setDeletingService] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadServices = useCallback(async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminServicesApi.getAll(params);
      if (res && res.services) {
        setServices(res.services);
      } else {
        setServices([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load services.');
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    adminServicesApi
      .getAll(params)
      .then((res) => {
        if (isMounted) {
          if (res && res.services) {
            setServices(res.services);
          } else {
            setServices([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load services.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, searchQuery]);

  // Open modal for new service
  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open modal for edit service
  const handleOpenEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      slug: service.slug || '',
      short_description: service.short_description || '',
      description: service.description || '',
      technologies: Array.isArray(service.technologies)
        ? service.technologies.join(', ')
        : service.technologies || '',
      featured: Boolean(service.featured),
      status: service.status || 'published',
      display_order: typeof service.display_order === 'number' ? service.display_order : 0,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Handle title change with auto slug generation for new services
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    if (!editingService) {
      const autoSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, title: newTitle, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, title: newTitle }));
    }

    if (formErrors.title) {
      setFormErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Service title is required.';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Service slug is required.';
    } else if (!SLUG_REGEX.test(formData.slug.trim().toLowerCase())) {
      errors.slug = 'Slug must use lowercase alphanumeric characters and hyphens (e.g. "web-app-dev").';
    }

    if (!formData.short_description.trim()) {
      errors.short_description = 'Short description is required.';
    }

    const orderNum = Number(formData.display_order);
    if (isNaN(orderNum) || !Number.isInteger(orderNum)) {
      errors.display_order = 'Display order must be an integer.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    const techArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      short_description: formData.short_description.trim(),
      description: formData.description.trim() || formData.short_description.trim(),
      technologies: techArray,
      featured: Boolean(formData.featured),
      status: formData.status,
      display_order: parseInt(formData.display_order, 10) || 0,
    };

    try {
      if (editingService) {
        await adminServicesApi.update(editingService.id, payload);
        setSuccessMessage(`Service "${payload.title}" updated successfully.`);
      } else {
        await adminServicesApi.create(payload);
        setSuccessMessage(`Service "${payload.title}" created successfully.`);
      }

      setIsFormOpen(false);
      setEditingService(null);
      setFormData(INITIAL_FORM_STATE);
      setTimeout(() => setSuccessMessage(''), 4000);
      reloadServices();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('slug')) {
        setFormErrors((prev) => ({ ...prev, slug: err.message }));
      } else {
        setError(err.message || 'Failed to save service.');
        setTimeout(() => setError(''), 5000);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleConfirmDelete = async () => {
    if (!deletingService) return;

    setIsDeleting(true);
    try {
      await adminServicesApi.delete(deletingService.id);
      setSuccessMessage(`Service "${deletingService.title}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setDeletingService(null);
      reloadServices();
    } catch (err) {
      setError(err.message || 'Failed to delete service.');
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
    <div className="admin-services-page">
      {/* Header */}
      <header className="admin-services__header">
        <div className="admin-services__header-text">
          <h1 className="admin-services__title">Services</h1>
          <p className="admin-services__subtitle">
            Manage the services displayed on the website.
          </p>
        </div>
        <div className="admin-services__header-actions">
          <span className="admin-services__count-badge font-mono">
            {services.length} {services.length === 1 ? 'Service' : 'Services'}
          </span>
          <button
            type="button"
            onClick={reloadServices}
            className="admin-refresh-btn"
            title="Refresh services list"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="admin-action-btn admin-action-btn--edit admin-new-service-btn"
          >
            + New Service
          </button>
        </div>
      </header>

      {/* Global Alerts */}
      {successMessage && (
        <div className="admin-services-alert admin-services-alert--success" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="admin-services-alert admin-services-alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <section className="admin-services-filters" aria-label="Filters">
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
            placeholder="Search by title, slug, or description..."
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
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
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

      {/* Main Content */}
      {loading ? (
        <div className="admin-services-loading">
          <p className="font-mono">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="admin-services-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 className="admin-services-empty-title">
            {statusFilter || searchQuery ? 'No matching services found' : 'No services configured yet'}
          </h2>
          <p className="admin-services-empty-desc">
            {statusFilter || searchQuery
              ? 'Try adjusting your search criteria or clearing active filters.'
              : 'Add your first service offerings to display them on the website.'}
          </p>
          {statusFilter || searchQuery ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="admin-action-btn admin-action-btn--edit"
            >
              Clear Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="admin-action-btn admin-action-btn--edit"
            >
              + Create Service
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="admin-table-container">
            <table className="admin-table" aria-label="Services Management Table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Order</th>
                  <th>Updated</th>
                  <th className="admin-table__actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="admin-service-cell">
                        <span className="admin-service-cell__title">{service.title}</span>
                        <span className="admin-service-cell__slug">{service.slug}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${service.status}`}>
                        <span className="admin-status-badge-dot" aria-hidden="true" />
                        {service.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-featured-badge ${service.featured ? 'admin-featured-badge--yes' : 'admin-featured-badge--no'}`}>
                        {service.featured ? 'Featured' : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-order-pill font-mono">
                        #{service.display_order}
                      </span>
                    </td>
                    <td>
                      <span className="admin-table-date">{formatDate(service.updated_at || service.created_at)}</span>
                    </td>
                    <td className="admin-table__actions-col">
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(service)}
                          className="admin-action-btn admin-action-btn--edit"
                          title="Edit this service"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingService(service)}
                          className="admin-action-btn admin-action-btn--delete"
                          title="Delete this service"
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

          {/* Mobile Cards */}
          <div className="admin-mobile-cards">
            {services.map((service) => (
              <div key={service.id} className="admin-mobile-card">
                <div className="admin-mobile-card__header">
                  <div>
                    <h2 className="admin-mobile-card__title">{service.title}</h2>
                    <span className="admin-mobile-card__slug">{service.slug}</span>
                  </div>
                  <span className={`admin-status-badge admin-status-badge--${service.status}`}>
                    <span className="admin-status-badge-dot" aria-hidden="true" />
                    {service.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p className="admin-mobile-card__desc">
                  {service.short_description}
                </p>

                <div className="admin-mobile-card__meta">
                  <span className="admin-order-pill font-mono">Order: #{service.display_order}</span>
                  {service.featured && (
                    <span className="admin-featured-badge admin-featured-badge--yes">Featured</span>
                  )}
                  <span className="admin-table-date">{formatDate(service.updated_at || service.created_at)}</span>
                </div>

                <div className="admin-mobile-card__actions">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="admin-action-btn admin-action-btn--edit"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingService(service)}
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

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !saving && setIsFormOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
        >
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="service-modal-title" className="admin-modal-title">
                    {editingService ? 'Edit Service' : 'Create New Service'}
                  </h2>
                  <p className="admin-modal-subtitle">
                    {editingService
                      ? `Updating "${editingService.title}"`
                      : 'Define service title, description, and technologies.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsFormOpen(false)}
                  className="admin-modal-close-btn"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveService} className="admin-service-form" noValidate>
                {/* Title */}
                <div className="admin-form-group">
                  <label htmlFor="service-title" className="admin-form-label">
                    Service Title <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="service-title"
                    name="title"
                    type="text"
                    className={`admin-form-input ${formErrors.title ? 'admin-form-input--error' : ''}`}
                    placeholder="e.g. Web Application Development"
                    value={formData.title}
                    onChange={handleTitleChange}
                    disabled={saving}
                  />
                  {formErrors.title && <span className="admin-field-error">{formErrors.title}</span>}
                </div>

                {/* Slug */}
                <div className="admin-form-group">
                  <label htmlFor="service-slug" className="admin-form-label">
                    Slug <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="service-slug"
                    name="slug"
                    type="text"
                    className={`admin-form-input ${formErrors.slug ? 'admin-form-input--error' : ''}`}
                    placeholder="e.g. web-application-development"
                    value={formData.slug}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span className="admin-form-hint">
                    Unique URL-safe identifier (e.g. "backend-development").
                  </span>
                  {formErrors.slug && <span className="admin-field-error">{formErrors.slug}</span>}
                </div>

                {/* Short Description */}
                <div className="admin-form-group">
                  <label htmlFor="service-short-desc" className="admin-form-label">
                    Short Description <span className="admin-form-required">*</span>
                  </label>
                  <textarea
                    id="service-short-desc"
                    name="short_description"
                    rows="3"
                    className={`admin-form-textarea ${formErrors.short_description ? 'admin-form-textarea--error' : ''}`}
                    placeholder="Brief 1-2 sentence overview of what this service delivers..."
                    value={formData.short_description}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  {formErrors.short_description && (
                    <span className="admin-field-error">{formErrors.short_description}</span>
                  )}
                </div>

                {/* Full Description */}
                <div className="admin-form-group">
                  <label htmlFor="service-desc" className="admin-form-label">
                    Detailed Description
                  </label>
                  <textarea
                    id="service-desc"
                    name="description"
                    rows="4"
                    className="admin-form-textarea"
                    placeholder="Extended service specifications, workflow details, or deliverables..."
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                {/* Technologies */}
                <div className="admin-form-group">
                  <label htmlFor="service-techs" className="admin-form-label">
                    Technologies
                  </label>
                  <input
                    id="service-techs"
                    name="technologies"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Python, Flask, MySQL, REST APIs"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span className="admin-form-hint">
                    Separate multiple technologies with commas.
                  </span>
                </div>

                {/* Inline Group: Display Order & Status */}
                <div className="admin-form-group--inline">
                  <div className="admin-form-group">
                    <label htmlFor="service-order" className="admin-form-label">
                      Display Order
                    </label>
                    <input
                      id="service-order"
                      name="display_order"
                      type="number"
                      min="0"
                      className={`admin-form-input ${formErrors.display_order ? 'admin-form-input--error' : ''}`}
                      value={formData.display_order}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                    {formErrors.display_order && (
                      <span className="admin-field-error">{formErrors.display_order}</span>
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="service-status" className="admin-form-label">
                      Status
                    </label>
                    <select
                      id="service-status"
                      name="status"
                      className="admin-form-select"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={saving}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Featured Checkbox */}
                <label className="admin-form-checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    className="admin-form-checkbox"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span>Mark as Featured service</span>
                </label>

                {/* Modal Actions */}
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setIsFormOpen(false)}
                    className="admin-action-btn admin-action-btn--delete"
                    style={{ background: 'transparent', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="admin-action-btn admin-action-btn--edit"
                  >
                    {saving
                      ? 'Saving...'
                      : editingService
                      ? 'Save Changes'
                      : 'Save Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingService && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isDeleting && setDeletingService(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-service-modal-title"
        >
          <div className="admin-modal-container admin-modal-container--sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="delete-service-modal-title" className="admin-modal-title">
                    Delete this service?
                  </h2>
                  <p className="admin-modal-subtitle">
                    This action cannot be undone.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingService(null)}
                  className="admin-modal-close-btn"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-4)' }}>
                Are you sure you want to permanently delete the service <strong>"{deletingService.title}"</strong> ({deletingService.slug})?
              </p>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingService(null)}
                  className="admin-action-btn admin-action-btn--edit"
                  style={{ background: 'transparent', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="admin-action-btn admin-action-btn--delete"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Service'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
