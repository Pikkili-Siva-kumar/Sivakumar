import React, { useState, useEffect } from 'react';
import { adminSettingsApi } from '../../services/api';
import { useSiteSettings } from '../../context/useSiteSettings';
import './AdminSettings.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminSettingsPage() {
  const { refreshSettings } = useSiteSettings();

  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    linkedin_url: '',
    github_url: '',
    seo_title: '',
    seo_description: '',
    maintenance_mode: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);
  const [successMessages, setSuccessMessages] = useState({});
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  // Maintenance confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetMaintenanceState, setTargetMaintenanceState] = useState(false);

  useEffect(() => {
    let isMounted = true;
    adminSettingsApi
      .getSettings()
      .then((res) => {
        if (isMounted && res && res.settings) {
          setFormData({
            site_name: res.settings.site_name || '',
            site_description: res.settings.site_description || '',
            contact_email: res.settings.contact_email || '',
            contact_phone: res.settings.contact_phone || '',
            linkedin_url: res.settings.linkedin_url || '',
            github_url: res.settings.github_url || '',
            seo_title: res.settings.seo_title || '',
            seo_description: res.settings.seo_description || '',
            maintenance_mode: Boolean(res.settings.maintenance_mode),
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setGlobalError(err.message || 'Failed to load current settings.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (globalError) {
      setGlobalError('');
    }
  };

  const showSectionSuccess = (sectionKey, message) => {
    setSuccessMessages((prev) => ({ ...prev, [sectionKey]: message }));
    setTimeout(() => {
      setSuccessMessages((prev) => {
        const next = { ...prev };
        delete next[sectionKey];
        return next;
      });
    }, 4000);
  };

  const saveSettingsPayload = async (payload, sectionKey, successMsg) => {
    setSavingSection(sectionKey);
    setGlobalError('');
    try {
      const res = await adminSettingsApi.updateSettings(payload);
      if (res && res.settings) {
        setFormData((prev) => ({
          ...prev,
          ...res.settings,
          maintenance_mode: Boolean(res.settings.maintenance_mode),
        }));
      }
      showSectionSuccess(sectionKey, successMsg);
      await refreshSettings();
    } catch (err) {
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
      }
      setGlobalError(err.message || 'Failed to save settings.');
    } finally {
      setSavingSection(null);
    }
  };

  // Section 1: Site Information
  const handleSaveSiteInfo = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.site_name.trim()) {
      newErrors.site_name = 'Site Name is required.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveSettingsPayload(
      {
        site_name: formData.site_name.trim(),
        site_description: formData.site_description.trim(),
      },
      'site',
      'Site information saved successfully.'
    );
  };

  // Section 2: Contact & Social
  const handleSaveContactSocial = (e) => {
    e.preventDefault();
    const newErrors = {};
    const email = formData.contact_email.trim();
    if (!email) {
      newErrors.contact_email = 'Contact email is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.contact_email = 'Please provide a valid email address.';
    }

    const validateUrl = (url, fieldName) => {
      const trimmed = url.trim();
      if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        newErrors[fieldName] = 'URL must start with http:// or https://';
      }
    };

    validateUrl(formData.linkedin_url, 'linkedin_url');
    validateUrl(formData.github_url, 'github_url');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveSettingsPayload(
      {
        contact_email: email,
        contact_phone: formData.contact_phone.trim(),
        linkedin_url: formData.linkedin_url.trim(),
        github_url: formData.github_url.trim(),
      },
      'contact',
      'Contact and social links saved successfully.'
    );
  };

  // Section 3: SEO
  const handleSaveSEO = (e) => {
    e.preventDefault();
    saveSettingsPayload(
      {
        seo_title: formData.seo_title.trim(),
        seo_description: formData.seo_description.trim(),
      },
      'seo',
      'SEO settings saved successfully.'
    );
  };

  // Section 4: Maintenance Mode
  const triggerMaintenanceToggle = (newState) => {
    setTargetMaintenanceState(newState);
    setShowConfirmModal(true);
  };

  const handleConfirmMaintenanceToggle = async () => {
    setShowConfirmModal(false);
    await saveSettingsPayload(
      { maintenance_mode: targetMaintenanceState },
      'maintenance',
      targetMaintenanceState
        ? 'Maintenance mode is now ACTIVE. Public visitors will see the maintenance screen.'
        : 'Maintenance mode is now INACTIVE. Public website is live.'
    );
  };

  if (isLoading) {
    return (
      <div className="admin-settings-page">
        <header className="admin-settings__header">
          <h1 className="admin-settings__title">Settings</h1>
          <p className="admin-settings__subtitle">Loading website configuration...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="admin-settings-page">
      <header className="admin-settings__header">
        <h1 className="admin-settings__title">Settings</h1>
        <p className="admin-settings__subtitle">Manage website information and configuration.</p>
      </header>

      {globalError && (
        <div className="admin-settings__alert admin-settings__alert--error" role="alert">
          <span>⚠️</span>
          <span>{globalError}</span>
        </div>
      )}

      {/* SECTION 1 — Site Information */}
      <section className="admin-settings-card" aria-labelledby="section-site-info">
        <div className="admin-settings-card__header">
          <h2 id="section-site-info" className="admin-settings-card__title">Site Information</h2>
          <p className="admin-settings-card__desc">Primary brand identity and public profile summary.</p>
        </div>

        {successMessages.site && (
          <div className="admin-settings__alert admin-settings__alert--success" role="status">
            <span>✓</span>
            <span>{successMessages.site}</span>
          </div>
        )}

        <form onSubmit={handleSaveSiteInfo} className="admin-settings-form">
          <div className="admin-settings-field">
            <label htmlFor="setting-site_name" className="admin-settings-label">
              <span>Site Name <span className="required">*</span></span>
              <span className="admin-settings-hint">Max 100 characters</span>
            </label>
            <input
              id="setting-site_name"
              name="site_name"
              type="text"
              value={formData.site_name}
              onChange={handleChange}
              className={`admin-settings-input ${errors.site_name ? 'admin-settings-input--error' : ''}`}
              placeholder="e.g. Siva Kumar"
              maxLength={100}
            />
            {errors.site_name && <span className="admin-settings-error">{errors.site_name}</span>}
          </div>

          <div className="admin-settings-field">
            <label htmlFor="setting-site_description" className="admin-settings-label">
              <span>Site Description</span>
              <span className="admin-settings-hint">Max 500 characters</span>
            </label>
            <textarea
              id="setting-site_description"
              name="site_description"
              rows={3}
              value={formData.site_description}
              onChange={handleChange}
              className={`admin-settings-textarea ${errors.site_description ? 'admin-settings-textarea--error' : ''}`}
              placeholder="Brief description of your expertise and professional focus"
              maxLength={500}
            />
            {errors.site_description && <span className="admin-settings-error">{errors.site_description}</span>}
          </div>

          <div className="admin-settings-card__actions">
            <button
              type="submit"
              disabled={savingSection === 'site'}
              className="admin-settings-btn admin-settings-btn--primary"
            >
              {savingSection === 'site' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2 — Contact & Social */}
      <section className="admin-settings-card" aria-labelledby="section-contact-social">
        <div className="admin-settings-card__header">
          <h2 id="section-contact-social" className="admin-settings-card__title">Contact &amp; Social</h2>
          <p className="admin-settings-card__desc">Direct communication channels, masked phone format, and profile links.</p>
        </div>

        {successMessages.contact && (
          <div className="admin-settings__alert admin-settings__alert--success" role="status">
            <span>✓</span>
            <span>{successMessages.contact}</span>
          </div>
        )}

        <form onSubmit={handleSaveContactSocial} className="admin-settings-form">
          <div className="admin-settings-grid">
            <div className="admin-settings-field">
              <label htmlFor="setting-contact_email" className="admin-settings-label">
                <span>Contact Email <span className="required">*</span></span>
              </label>
              <input
                id="setting-contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                className={`admin-settings-input ${errors.contact_email ? 'admin-settings-input--error' : ''}`}
                placeholder="you@example.com"
                maxLength={255}
              />
              {errors.contact_email && <span className="admin-settings-error">{errors.contact_email}</span>}
            </div>

            <div className="admin-settings-field">
              <label htmlFor="setting-contact_phone" className="admin-settings-label">
                <span>Contact Phone</span>
                <span className="admin-settings-hint">Masked format preserved</span>
              </label>
              <input
                id="setting-contact_phone"
                name="contact_phone"
                type="text"
                value={formData.contact_phone}
                onChange={handleChange}
                className={`admin-settings-input ${errors.contact_phone ? 'admin-settings-input--error' : ''}`}
                placeholder="939867XXXX"
                maxLength={50}
              />
              {errors.contact_phone && <span className="admin-settings-error">{errors.contact_phone}</span>}
            </div>
          </div>

          <div className="admin-settings-grid">
            <div className="admin-settings-field">
              <label htmlFor="setting-linkedin_url" className="admin-settings-label">
                <span>LinkedIn URL</span>
              </label>
              <input
                id="setting-linkedin_url"
                name="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className={`admin-settings-input ${errors.linkedin_url ? 'admin-settings-input--error' : ''}`}
                placeholder="https://linkedin.com/in/username"
                maxLength={255}
              />
              {errors.linkedin_url && <span className="admin-settings-error">{errors.linkedin_url}</span>}
            </div>

            <div className="admin-settings-field">
              <label htmlFor="setting-github_url" className="admin-settings-label">
                <span>GitHub URL</span>
              </label>
              <input
                id="setting-github_url"
                name="github_url"
                type="url"
                value={formData.github_url}
                onChange={handleChange}
                className={`admin-settings-input ${errors.github_url ? 'admin-settings-input--error' : ''}`}
                placeholder="https://github.com/username"
                maxLength={255}
              />
              {errors.github_url && <span className="admin-settings-error">{errors.github_url}</span>}
            </div>
          </div>

          <div className="admin-settings-card__actions">
            <button
              type="submit"
              disabled={savingSection === 'contact'}
              className="admin-settings-btn admin-settings-btn--primary"
            >
              {savingSection === 'contact' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 3 — SEO */}
      <section className="admin-settings-card" aria-labelledby="section-seo">
        <div className="admin-settings-card__header">
          <h2 id="section-seo" className="admin-settings-card__title">SEO</h2>
          <p className="admin-settings-card__desc">Search engine metadata and default page headers.</p>
        </div>

        {successMessages.seo && (
          <div className="admin-settings__alert admin-settings__alert--success" role="status">
            <span>✓</span>
            <span>{successMessages.seo}</span>
          </div>
        )}

        <form onSubmit={handleSaveSEO} className="admin-settings-form">
          <div className="admin-settings-field">
            <label htmlFor="setting-seo_title" className="admin-settings-label">
              <span>Default SEO Title</span>
              <span className="admin-settings-hint">Max 150 characters</span>
            </label>
            <input
              id="setting-seo_title"
              name="seo_title"
              type="text"
              value={formData.seo_title}
              onChange={handleChange}
              className={`admin-settings-input ${errors.seo_title ? 'admin-settings-input--error' : ''}`}
              placeholder="e.g. Siva Kumar | Professional Brand & Business"
              maxLength={150}
            />
            {errors.seo_title && <span className="admin-settings-error">{errors.seo_title}</span>}
          </div>

          <div className="admin-settings-field">
            <label htmlFor="setting-seo_description" className="admin-settings-label">
              <span>Default SEO Description</span>
              <span className="admin-settings-hint">Max 300 characters</span>
            </label>
            <textarea
              id="setting-seo_description"
              name="seo_description"
              rows={3}
              value={formData.seo_description}
              onChange={handleChange}
              className={`admin-settings-textarea ${errors.seo_description ? 'admin-settings-textarea--error' : ''}`}
              placeholder="e.g. Siva Kumar - Professional Personal-Brand & Business"
              maxLength={300}
            />
            {errors.seo_description && <span className="admin-settings-error">{errors.seo_description}</span>}
          </div>

          <div className="admin-settings-card__actions">
            <button
              type="submit"
              disabled={savingSection === 'seo'}
              className="admin-settings-btn admin-settings-btn--primary"
            >
              {savingSection === 'seo' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 4 — System */}
      <section className="admin-settings-card" aria-labelledby="section-system">
        <div className="admin-settings-card__header">
          <h2 id="section-system" className="admin-settings-card__title">System</h2>
          <p className="admin-settings-card__desc">Temporarily disable normal public access while keeping administration available.</p>
        </div>

        {successMessages.maintenance && (
          <div className="admin-settings__alert admin-settings__alert--success" role="status">
            <span>✓</span>
            <span>{successMessages.maintenance}</span>
          </div>
        )}

        <div className="admin-maintenance-row">
          <div className="admin-maintenance-info">
            <strong style={{ color: 'var(--text-primary)' }}>Maintenance Mode</strong>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {formData.maintenance_mode
                ? 'Public visitors currently see the maintenance page.'
                : 'Website is live and publicly accessible.'}
            </span>
            <div style={{ marginTop: '4px' }}>
              <span
                className={`admin-maintenance-status-badge ${
                  formData.maintenance_mode
                    ? 'admin-maintenance-status-badge--active'
                    : 'admin-maintenance-status-badge--inactive'
                }`}
              >
                ● {formData.maintenance_mode ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>

          <div>
            {formData.maintenance_mode ? (
              <button
                type="button"
                disabled={savingSection === 'maintenance'}
                onClick={() => triggerMaintenanceToggle(false)}
                className="admin-settings-btn admin-settings-btn--secondary"
              >
                {savingSection === 'maintenance' ? 'Updating...' : 'Disable Maintenance Mode'}
              </button>
            ) : (
              <button
                type="button"
                disabled={savingSection === 'maintenance'}
                onClick={() => triggerMaintenanceToggle(true)}
                className="admin-settings-btn admin-settings-btn--danger"
              >
                {savingSection === 'maintenance' ? 'Updating...' : 'Enable Maintenance Mode'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="admin-modal-card">
            <h3 id="modal-title" className="admin-modal-title">
              {targetMaintenanceState ? 'Enable maintenance mode?' : 'Disable maintenance mode?'}
            </h3>
            <p className="admin-modal-desc">
              {targetMaintenanceState
                ? 'This will change how public visitors access the website.'
                : 'This will restore public visitor access to the website.'}
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="admin-settings-btn admin-settings-btn--secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMaintenanceToggle}
                className={`admin-settings-btn ${targetMaintenanceState ? 'admin-settings-btn--danger' : 'admin-settings-btn--primary'}`}
              >
                {targetMaintenanceState ? 'Enable Maintenance Mode' : 'Disable Maintenance Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
