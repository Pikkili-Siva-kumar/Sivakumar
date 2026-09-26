import React, { useState, useEffect, useCallback } from 'react';
import { adminBlogApi } from '../../services/api';
import './AdminBlog.css';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
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
    });
  } catch {
    return isoStr;
  }
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const INITIAL_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  cover_image_url: '',
  status: 'draft',
  featured: false,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // null = new post, object = edit
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal
  const [deletingPost, setDeletingPost] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (categoryFilter.trim()) params.category = categoryFilter.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await adminBlogApi.getAll(params);
      if (res && Array.isArray(res.posts)) {
        setPosts(res.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load blog posts.');
    }
  }, [searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;
    const params = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (categoryFilter.trim()) params.category = categoryFilter.trim();
    if (statusFilter) params.status = statusFilter;

    adminBlogApi
      .getAll(params)
      .then((res) => {
        if (isMounted) {
          if (res && Array.isArray(res.posts)) {
            setPosts(res.posts);
          } else {
            setPosts([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load blog posts.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery, categoryFilter, statusFilter]);

  // Unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean))
  );

  // Open editor for Create
  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setIsEditorOpen(true);
  };

  // Open editor for Edit
  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      cover_image_url: post.cover_image_url || '',
      status: post.status || 'draft',
      featured: Boolean(post.featured),
    });
    setFormErrors({});
    setIsEditorOpen(true);
  };

  // Close editor
  const handleCloseEditor = () => {
    if (!isSubmitting) {
      setIsEditorOpen(false);
      setEditingPost(null);
      setFormErrors({});
    }
  };

  // Generate slug helper
  const handleGenerateSlug = () => {
    if (formData.title.trim()) {
      const generated = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: generated }));
      if (formErrors.slug) {
        setFormErrors((prev) => ({ ...prev, slug: undefined }));
      }
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required.';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug.trim().toLowerCase())) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
    }
    if (!formData.content.trim()) {
      errors.content = 'Content is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit editor form
  const handleSubmit = async (targetStatus) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    const statusToUse = targetStatus || formData.status || 'draft';

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      excerpt: formData.excerpt.trim() || undefined,
      content: formData.content.trim(),
      category: formData.category.trim() || undefined,
      cover_image_url: formData.cover_image_url.trim() || undefined,
      status: statusToUse,
      featured: Boolean(formData.featured),
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingPost) {
        const res = await adminBlogApi.update(editingPost.id, payload);
        setSuccessMessage(res.message || 'Blog post updated successfully.');
      } else {
        const res = await adminBlogApi.create(payload);
        setSuccessMessage(res.message || 'Blog post created successfully.');
      }

      setIsEditorOpen(false);
      setEditingPost(null);
      await fetchPosts();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save blog post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post deletion
  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    setError('');

    try {
      const res = await adminBlogApi.delete(deletingPost.id);
      setSuccessMessage(res.message || `Post "${deletingPost.title}" deleted.`);
      setDeletingPost(null);
      await fetchPosts();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || categoryFilter.trim() || statusFilter
  );

  return (
    <div className="admin-blog-page">
      {/* Header */}
      <div className="admin-blog__header">
        <div className="admin-blog__header-text">
          <h1 className="admin-blog__title">Blog</h1>
          <p className="admin-blog__subtitle">
            Create and manage articles, notes, and technical writing.
          </p>
        </div>

        <div className="admin-blog__header-actions">
          <span className="admin-blog__count-badge">
            {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
          </span>

          <button
            type="button"
            className="btn btn-primary admin-new-post-btn"
            onClick={handleOpenCreate}
          >
            + New Post
          </button>

          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => {
              setLoading(true);
              fetchPosts().finally(() => setLoading(false));
            }}
            title="Refresh articles"
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

      {/* Success Alert */}
      {successMessage && (
        <div className="admin-blog-alert admin-blog-alert--success" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="admin-blog-alert admin-blog-alert--error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="admin-blog-filters">
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
            placeholder="Search posts by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search posts"
          />
        </div>

        <div className="admin-filter-select-group">
          {uniqueCategories.length > 0 && (
            <select
              className="admin-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
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
        <div className="admin-blog-loading">
          <div className="admin-blog-loading__spinner" />
          <span className="admin-blog-loading__text">Loading blog articles...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-blog-empty">
          <svg
            className="admin-blog-empty__icon"
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
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <p className="admin-blog-empty__title">No articles found</p>
          <p className="admin-blog-empty__desc">
            {hasActiveFilters
              ? 'No blog posts match your search or filter criteria. Try clearing filters.'
              : 'You have not written any blog posts yet. Click "+ New Post" to write your first article.'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={handleClearFilters}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Reset Filters
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleOpenCreate}
              style={{ marginTop: 'var(--space-2)' }}
            >
              + Create First Post
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-blog-table-card">
            <div className="admin-table-container">
              <table className="admin-blog-table">
                <thead>
                  <tr>
                    <th>Post</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Published</th>
                    <th>Updated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      {/* Post Column */}
                      <td>
                        <div className="admin-post-title-cell">
                          <span className="admin-post-title">{post.title}</span>
                          <span className="admin-post-slug">/{post.slug}</span>
                        </div>
                      </td>

                      {/* Category Column */}
                      <td>
                        {post.category ? (
                          <span className="admin-category-badge">{post.category}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td>
                        <span
                          className={`admin-post-status-badge ${
                            post.status === 'published'
                              ? 'admin-post-status-badge--published'
                              : 'admin-post-status-badge--draft'
                          }`}
                        >
                          <span className="admin-post-status-dot" />
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Featured Column */}
                      <td>
                        {post.featured ? (
                          <span className="admin-featured-star">★ Featured</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Published Column */}
                      <td>
                        <span className="admin-table-date">
                          {formatDate(post.published_at)}
                        </span>
                      </td>

                      {/* Updated Column */}
                      <td>
                        <span className="admin-table-date">
                          {formatDate(post.updated_at)}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td>
                        <div className="admin-table__actions">
                          <button
                            type="button"
                            className="admin-btn-action"
                            onClick={() => handleOpenEdit(post)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-btn-action admin-btn-action--danger"
                            onClick={() => setDeletingPost(post)}
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
          </div>

          {/* Mobile Cards View */}
          <div className="admin-blog-mobile-list">
            {posts.map((post) => (
              <div key={post.id} className="admin-blog-card">
                <div className="admin-blog-card__header">
                  <div className="admin-blog-card__title-group">
                    <h3 className="admin-blog-card__title">{post.title}</h3>
                    <span className="admin-blog-card__slug">/{post.slug}</span>
                  </div>
                </div>

                <div className="admin-blog-card__badges">
                  <span
                    className={`admin-post-status-badge ${
                      post.status === 'published'
                        ? 'admin-post-status-badge--published'
                        : 'admin-post-status-badge--draft'
                    }`}
                  >
                    <span className="admin-post-status-dot" />
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>

                  {post.featured && (
                    <span className="admin-featured-star">★ Featured</span>
                  )}

                  {post.category && (
                    <span className="admin-category-badge">{post.category}</span>
                  )}
                </div>

                <div className="admin-blog-card__meta">
                  <span>Published: {formatDate(post.published_at)}</span>
                  <span>Updated: {formatDate(post.updated_at)}</span>
                </div>

                <div className="admin-blog-card__actions">
                  <button
                    type="button"
                    className="admin-btn-action"
                    onClick={() => handleOpenEdit(post)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="admin-btn-action admin-btn-action--danger"
                    onClick={() => setDeletingPost(post)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* BLOG EDITOR MODAL */}
      {isEditorOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={handleCloseEditor}
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-modal-title"
        >
          <div
            className="admin-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <div>
                  <h2 id="editor-modal-title" className="admin-modal-title">
                    {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </h2>
                  <p className="admin-modal-subtitle">
                    {editingPost
                      ? `Editing "${editingPost.title}"`
                      : 'Compose a new technical article or note.'}
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={handleCloseEditor}
                  disabled={isSubmitting}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Title Field */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="post-title">
                  Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="post-title"
                  type="text"
                  className={`admin-form-input ${
                    formErrors.title ? 'admin-form-input--error' : ''
                  }`}
                  placeholder="e.g. Architecting Scalable REST APIs with Flask"
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      // Auto-suggest slug for new posts if user hasn't edited slug manually
                      slug: !editingPost && !prev.slug ? generateSlug(newTitle) : prev.slug,
                    }));
                    if (formErrors.title) {
                      setFormErrors((prev) => ({ ...prev, title: undefined }));
                    }
                  }}
                  disabled={isSubmitting}
                />
                {formErrors.title && (
                  <span className="admin-form-error-msg">{formErrors.title}</span>
                )}
              </div>

              {/* Slug Field with Generator */}
              <div className="admin-form-group">
                <div className="admin-form-label-row">
                  <label className="admin-form-label" htmlFor="post-slug">
                    Slug <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <button
                    type="button"
                    className="admin-form-helper-btn"
                    onClick={handleGenerateSlug}
                    tabIndex={-1}
                  >
                    Generate Slug from Title
                  </button>
                </div>
                <input
                  id="post-slug"
                  type="text"
                  className={`admin-form-input ${
                    formErrors.slug ? 'admin-form-input--error' : ''
                  }`}
                  placeholder="e.g. architecting-scalable-rest-apis-with-flask"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    if (formErrors.slug) {
                      setFormErrors((prev) => ({ ...prev, slug: undefined }));
                    }
                  }}
                  disabled={isSubmitting}
                />
                {formErrors.slug ? (
                  <span className="admin-form-error-msg">{formErrors.slug}</span>
                ) : (
                  <span className="admin-form-hint">
                    URL identifier. Lowercase letters, numbers, and hyphens only.
                  </span>
                )}
              </div>

              {/* Category & Tags inline */}
              <div className="admin-form-group--inline">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="post-category">
                    Category
                  </label>
                  <input
                    id="post-category"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Engineering, Architecture, Notes"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="post-tags">
                    Tags
                  </label>
                  <input
                    id="post-tags"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. Python, Flask, System Design (comma separated)"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tags: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="post-cover-image">
                  Cover Image URL
                </label>
                <input
                  id="post-cover-image"
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. https://images.unsplash.com/... or /images/blog/cover.jpg"
                  value={formData.cover_image_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }))
                  }
                  disabled={isSubmitting}
                />
              </div>

              {/* Excerpt */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="post-excerpt">
                  Excerpt
                </label>
                <textarea
                  id="post-excerpt"
                  className="admin-form-textarea"
                  rows={2}
                  placeholder="A concise synopsis or summary of the post..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  disabled={isSubmitting}
                />
              </div>

              {/* Content */}
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="post-content">
                  Content <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  id="post-content"
                  className={`admin-form-textarea ${
                    formErrors.content ? 'admin-form-textarea--error' : ''
                  }`}
                  rows={9}
                  placeholder="Write article content here..."
                  value={formData.content}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, content: e.target.value }));
                    if (formErrors.content) {
                      setFormErrors((prev) => ({ ...prev, content: undefined }));
                    }
                  }}
                  disabled={isSubmitting}
                />
                {formErrors.content && (
                  <span className="admin-form-error-msg">{formErrors.content}</span>
                )}
              </div>

              {/* Status & Featured */}
              <div className="admin-form-group--inline">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="post-status">
                    Status
                  </label>
                  <select
                    id="post-status"
                    className="admin-form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    disabled={isSubmitting}
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Public)</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ justifyContent: 'center' }}>
                  <label className="admin-form-checkbox-label">
                    <input
                      type="checkbox"
                      className="admin-form-checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                      }
                      disabled={isSubmitting}
                    />
                    Mark as Featured Article
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn admin-modal-btn--secondary"
                  onClick={handleCloseEditor}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                {editingPost ? (
                  <>
                    <button
                      type="button"
                      className="admin-modal-btn admin-modal-btn--primary"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>

                    {formData.status === 'draft' ? (
                      <button
                        type="button"
                        className="admin-modal-btn admin-modal-btn--primary"
                        onClick={() => handleSubmit('published')}
                        disabled={isSubmitting}
                      >
                        Publish Now
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-modal-btn admin-modal-btn--draft"
                        onClick={() => handleSubmit('draft')}
                        disabled={isSubmitting}
                      >
                        Unpublish (Save as Draft)
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="admin-modal-btn admin-modal-btn--draft"
                      onClick={() => handleSubmit('draft')}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </button>

                    <button
                      type="button"
                      className="admin-modal-btn admin-modal-btn--primary"
                      onClick={() => handleSubmit('published')}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPost && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isDeleting && setDeletingPost(null)}
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
                    Delete this post?
                  </h2>
                  <p className="admin-modal-subtitle">
                    Permanent article removal
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close-btn"
                  onClick={() => !isDeleting && setDeletingPost(null)}
                  disabled={isDeleting}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <p className="admin-confirm-body">
                This action cannot be undone.
              </p>

              <p className="admin-confirm-body">
                Target post:{' '}
                <span className="admin-confirm-highlight">
                  {deletingPost.title} (/{deletingPost.slug})
                </span>
              </p>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn admin-modal-btn--secondary"
                  onClick={() => setDeletingPost(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-modal-btn admin-modal-btn--danger"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
