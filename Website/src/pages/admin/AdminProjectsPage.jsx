import React, { useState, useEffect, useCallback } from 'react';
import { adminProjectsApi } from '../../services/api';
import './AdminProjects.css';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const INITIAL_FORM_STATE = {
  title: '',
  slug: '',
  category: '',
  short_description: '',
  description: '',
  technologies: '',
  featured: false,
  status: 'published',
  case_study_route: '',
  image_url: '',
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal state
  const [deletingProject, setDeletingProject] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const reloadProjects = useCallback(async () => {
    try {
      const response = await adminProjectsApi.getAll();
      if (response && response.projects) {
        setProjects(response.projects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    adminProjectsApi
      .getAll()
      .then((response) => {
        if (isMounted) {
          if (response && response.projects) {
            setProjects(response.projects);
          } else {
            setProjects([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load projects.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Open modal for new project creation
  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open modal for editing an existing project
  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      category: project.category || '',
      short_description: project.short_description || '',
      description: project.description || '',
      technologies: Array.isArray(project.technologies)
        ? project.technologies.join(', ')
        : project.technologies || '',
      featured: Boolean(project.featured),
      status: project.status || 'published',
      case_study_route: project.case_study_route || '',
      image_url: project.image_url || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (saving) return;
    setIsFormOpen(false);
    setEditingProject(null);
    setFormErrors({});
  };

  // Helper to generate a URL slug from title
  const handleAutoSlug = () => {
    if (!formData.title) return;
    const generated = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: generated }));
    if (formErrors.slug) {
      setFormErrors((prev) => ({ ...prev, slug: '' }));
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

  const validateForm = () => {
    const errors = {};
    const trimmedTitle = formData.title.trim();
    const trimmedSlug = formData.slug.trim().toLowerCase();
    const trimmedCategory = formData.category.trim();
    const trimmedShortDesc = formData.short_description.trim();

    if (!trimmedTitle) {
      errors.title = 'Project title is required.';
    }

    if (!trimmedSlug) {
      errors.slug = 'Project slug is required.';
    } else if (!SLUG_REGEX.test(trimmedSlug)) {
      errors.slug = 'Invalid slug format. Use lowercase letters, numbers, and hyphens (e.g. my-project).';
    }

    if (!trimmedCategory) {
      errors.category = 'Project category is required.';
    }

    if (!trimmedShortDesc) {
      errors.short_description = 'Short description is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    // Parse technologies into clean array
    const techsArray = formData.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      category: formData.category.trim(),
      short_description: formData.short_description.trim(),
      description: formData.description.trim(),
      technologies: techsArray,
      featured: Boolean(formData.featured),
      status: formData.status,
      case_study_route: formData.case_study_route.trim() || null,
      image_url: formData.image_url.trim() || null,
    };

    try {
      if (editingProject) {
        await adminProjectsApi.update(editingProject.id, payload);
        setSuccessMessage(`Project "${payload.title}" updated successfully.`);
      } else {
        await adminProjectsApi.create(payload);
        setSuccessMessage(`Project "${payload.title}" created successfully.`);
      }
      setIsFormOpen(false);
      setEditingProject(null);
      await reloadProjects();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      if (err.status === 409) {
        setFormErrors((prev) => ({
          ...prev,
          slug: 'A project with this slug already exists. Please choose a unique slug.',
        }));
      } else {
        setError(err.message || 'Operation failed. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    setError('');
    try {
      await adminProjectsApi.delete(deletingProject.id);
      setSuccessMessage(`Project "${deletingProject.title}" was deleted.`);
      setDeletingProject(null);
      await reloadProjects();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-projects-page">
      {/* Header Bar */}
      <div className="admin-projects__header">
        <div className="admin-projects__header-text">
          <h1 className="admin-projects__title">Projects</h1>
          <p className="admin-projects__subtitle">
            Manage the projects displayed across the website.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="admin-btn admin-btn--primary admin-new-project-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>+ New Project</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="admin-projects-alert admin-projects-alert--success" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="admin-projects-alert admin-projects-alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Content Area: Table / Cards */}
      <div className="admin-projects-content">
        {loading ? (
          <div className="admin-projects-loading">
            <div className="admin-spinner" aria-hidden="true" />
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="admin-projects-empty">
            <p className="admin-projects-empty-title">No projects found</p>
            <p className="admin-projects-empty-desc">
              Get started by creating your first project showcase.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="admin-btn admin-btn--primary"
            >
              + Create First Project
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Updated</th>
                    <th className="admin-table__actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => (
                    <tr key={proj.id}>
                      <td>
                        <div className="admin-project-cell">
                          <span className="admin-project-cell__title">{proj.title}</span>
                          <span className="admin-project-cell__slug">/{proj.slug}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-category-pill">{proj.category}</span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-badge ${
                            proj.status === 'published'
                              ? 'admin-status-badge--published'
                              : 'admin-status-badge--draft'
                          }`}
                        >
                          <span className="admin-status-badge-dot" aria-hidden="true" />
                          {proj.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        {proj.featured ? (
                          <span className="admin-featured-badge admin-featured-badge--yes">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="admin-featured-badge admin-featured-badge--no">
                            Standard
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="admin-table-date">
                          {proj.updated_at
                            ? new Date(proj.updated_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>
                      <td className="admin-table__actions-col">
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(proj)}
                            className="admin-action-btn admin-action-btn--edit"
                            aria-label={`Edit ${proj.title}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProject(proj)}
                            className="admin-action-btn admin-action-btn--delete"
                            aria-label={`Delete ${proj.title}`}
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

            {/* Mobile Cards List View */}
            <div className="admin-mobile-cards">
              {projects.map((proj) => (
                <article key={proj.id} className="admin-mobile-card">
                  <div className="admin-mobile-card__header">
                    <div>
                      <h2 className="admin-mobile-card__title">{proj.title}</h2>
                      <span className="admin-mobile-card__slug">/{proj.slug}</span>
                    </div>
                    <span
                      className={`admin-status-badge ${
                        proj.status === 'published'
                          ? 'admin-status-badge--published'
                          : 'admin-status-badge--draft'
                      }`}
                    >
                      {proj.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="admin-mobile-card__desc">{proj.short_description}</p>

                  <div className="admin-mobile-card__meta">
                    <span className="admin-category-pill">{proj.category}</span>
                    {proj.featured && (
                      <span className="admin-featured-badge admin-featured-badge--yes">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  <div className="admin-mobile-card__actions">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(proj)}
                      className="admin-action-btn admin-action-btn--edit"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProject(proj)}
                      className="admin-action-btn admin-action-btn--delete"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-container">
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 className="admin-modal-title">
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <p className="admin-modal-subtitle">
                    {editingProject
                      ? `Editing: ${editingProject.title}`
                      : 'Add a verified engineering project to your portfolio.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="admin-modal-close"
                  aria-label="Close form"
                  disabled={saving}
                >
                  ✕
                </button>
              </div>

              <form className="admin-modal-form" onSubmit={handleFormSubmit} noValidate>
                {/* Title */}
                <div className="admin-form-group">
                  <label htmlFor="project-title" className="admin-label">
                    Project Title <span className="admin-required">*</span>
                  </label>
                  <input
                    id="project-title"
                    name="title"
                    type="text"
                    className={`admin-input ${formErrors.title ? 'admin-input--error' : ''}`}
                    placeholder="e.g. Distributed Task Scheduler"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  {formErrors.title && (
                    <span className="admin-error-message">{formErrors.title}</span>
                  )}
                </div>

                {/* Slug with Auto-generate helper */}
                <div className="admin-form-group">
                  <div className="admin-label-split">
                    <label htmlFor="project-slug" className="admin-label">
                      Slug <span className="admin-required">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoSlug}
                      className="admin-inline-link-btn"
                      disabled={saving || !formData.title}
                    >
                      Generate from Title
                    </button>
                  </div>
                  <input
                    id="project-slug"
                    name="slug"
                    type="text"
                    className={`admin-input ${formErrors.slug ? 'admin-input--error' : ''}`}
                    placeholder="e.g. distributed-task-scheduler"
                    value={formData.slug}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  {formErrors.slug && (
                    <span className="admin-error-message">{formErrors.slug}</span>
                  )}
                </div>

                {/* Category */}
                <div className="admin-form-group">
                  <label htmlFor="project-category" className="admin-label">
                    Category <span className="admin-required">*</span>
                  </label>
                  <input
                    id="project-category"
                    name="category"
                    type="text"
                    className={`admin-input ${formErrors.category ? 'admin-input--error' : ''}`}
                    placeholder="e.g. Distributed Systems • Backend • Golang"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  {formErrors.category && (
                    <span className="admin-error-message">{formErrors.category}</span>
                  )}
                </div>

                {/* Short Description */}
                <div className="admin-form-group">
                  <label htmlFor="project-short-desc" className="admin-label">
                    Short Description <span className="admin-required">*</span>
                  </label>
                  <textarea
                    id="project-short-desc"
                    name="short_description"
                    rows="3"
                    className={`admin-input admin-textarea ${formErrors.short_description ? 'admin-input--error' : ''}`}
                    placeholder="Brief 1-2 sentence summary displayed on project cards"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  {formErrors.short_description && (
                    <span className="admin-error-message">{formErrors.short_description}</span>
                  )}
                </div>

                {/* Description (Long / Optional) */}
                <div className="admin-form-group">
                  <label htmlFor="project-description" className="admin-label">
                    Detailed Description <span className="admin-label-hint">(optional)</span>
                  </label>
                  <textarea
                    id="project-description"
                    name="description"
                    rows="4"
                    className="admin-input admin-textarea"
                    placeholder="Detailed architecture explanation, outcomes, and technical design notes"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                {/* Technologies */}
                <div className="admin-form-group">
                  <label htmlFor="project-technologies" className="admin-label">
                    Technologies <span className="admin-label-hint">(comma-separated)</span>
                  </label>
                  <input
                    id="project-technologies"
                    name="technologies"
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Python, Flask, Redis, Docker, PostgreSQL"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                {/* Two-Column: Status & Featured */}
                <div className="admin-form-row">
                  <div className="admin-form-group admin-form-group--half">
                    <label htmlFor="project-status" className="admin-label">
                      Status
                    </label>
                    <select
                      id="project-status"
                      name="status"
                      className="admin-input admin-select"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={saving}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="admin-form-group admin-form-group--half admin-checkbox-group">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        disabled={saving}
                        className="admin-checkbox"
                      />
                      <span>Mark as Featured Project</span>
                    </label>
                  </div>
                </div>

                {/* Case Study Route & Image URL */}
                <div className="admin-form-row">
                  <div className="admin-form-group admin-form-group--half">
                    <label htmlFor="project-route" className="admin-label">
                      Case Study Route <span className="admin-label-hint">(optional)</span>
                    </label>
                    <input
                      id="project-route"
                      name="case_study_route"
                      type="text"
                      className="admin-input"
                      placeholder="e.g. /work/luxury-hotel-management"
                      value={formData.case_study_route}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  </div>

                  <div className="admin-form-group admin-form-group--half">
                    <label htmlFor="project-image" className="admin-label">
                      Image URL <span className="admin-label-hint">(optional)</span>
                    </label>
                    <input
                      id="project-image"
                      name="image_url"
                      type="text"
                      className="admin-input"
                      placeholder="Optional image URL"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="admin-btn admin-btn--secondary"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={saving}
                  >
                    {saving
                      ? 'Saving...'
                      : editingProject
                      ? 'Save Changes'
                      : 'Save Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProject && (
        <div className="admin-modal-backdrop" role="alertdialog" aria-modal="true">
          <div className="admin-modal-container admin-modal-container--sm">
            <div className="admin-modal-card admin-modal-card--danger">
              <div className="admin-danger-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>

              <h2 className="admin-confirm-title">Delete this project?</h2>
              <p className="admin-confirm-subtitle">
                Are you sure you want to delete <strong>&quot;{deletingProject.title}&quot;</strong>? This action cannot be undone.
              </p>

              <div className="admin-confirm-actions">
                <button
                  type="button"
                  onClick={() => setDeletingProject(null)}
                  className="admin-btn admin-btn--secondary"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="admin-btn admin-btn--danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
