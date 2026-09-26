/**
 * Frontend API Client Configuration
 * Step 15: User Authentication Integration
 * Standard API base configuration, authorization token handling, and endpoints.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Perform a fetch request to the Flask REST API.
 * Automatically attaches Authorization header if auth_token is stored.
 * @param {string} endpoint - API endpoint path (e.g. '/auth/login' or '/health')
 * @param {RequestInit} [options] - Standard Fetch API options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Attach stored auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        (data && (data.message || data.error)) || response.statusText || 'API request failed';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('Cannot reach the backend server. Is Flask running on port 5000?');
      networkError.status = 0;
      throw networkError;
    }
    throw error;
  }
}

/**
 * User Authentication API endpoints
 */
export const authApi = {
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getProfile: () => apiRequest('/auth/me'),
  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyResetToken: (token) =>
    apiRequest(`/auth/verify-reset-token/${encodeURIComponent(token)}`),
  resetPassword: ({ token, password, confirm_password }) =>
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, confirm_password }),
    }),
};

/**
 * Admin Authentication API endpoints
 * Step 16: Admin Authentication Integration
 */
export const adminAuthApi = {
  login: (credentials) =>
    apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getProfile: () => apiRequest('/admin/me'),
  logout: () =>
    apiRequest('/admin/logout', {
      method: 'POST',
    }),
};

/**
 * Public Projects API endpoints
 * Step 18: Real Project Management
 */
export const projectsApi = {
  getPublished: () => apiRequest('/projects'),
  getBySlug: (slug) => apiRequest(`/projects/${slug}`),
};

/**
 * Admin Projects CRUD API endpoints
 * Step 18: Real Project Management
 */
export const adminProjectsApi = {
  getAll: () => apiRequest('/admin/projects'),
  getById: (id) => apiRequest(`/admin/projects/${id}`),
  create: (projectData) =>
    apiRequest('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),
  update: (id, projectData) =>
    apiRequest(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),
  delete: (id) =>
    apiRequest(`/admin/projects/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Public Project Requests API
 * Step 19: Project Request Management
 */
export const projectRequestsApi = {
  submit: (requestData) =>
    apiRequest('/project-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    }),
};

/**
 * Admin Project Requests API
 * Step 19: Project Request Management
 */
export const adminProjectRequestsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/project-requests${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiRequest(`/admin/project-requests/${id}`),
  update: (id, updateData) =>
    apiRequest(`/admin/project-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
  delete: (id) =>
    apiRequest(`/admin/project-requests/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Public Contact Messages API
 * Step 20: Contact Messages Management
 */
export const contactMessagesApi = {
  submit: (messageData) =>
    apiRequest('/contact-messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
};

/**
 * Admin Contact Messages API
 * Step 20: Contact Messages Management
 */
export const adminMessagesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/messages${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiRequest(`/admin/messages/${id}`),
  update: (id, updateData) =>
    apiRequest(`/admin/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    }),
  delete: (id) =>
    apiRequest(`/admin/messages/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Public Services API
 * Step 21: Services Management CRUD
 */
export const servicesApi = {
  getAll: () => apiRequest('/services'),
  getBySlug: (slug) => apiRequest(`/services/${slug}`),
};

/**
 * Admin Services API
 * Step 21: Services Management CRUD
 */
export const adminServicesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/services${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiRequest(`/admin/services/${id}`),
  create: (serviceData) =>
    apiRequest('/admin/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    }),
  update: (id, serviceData) =>
    apiRequest(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    }),
  delete: (id) =>
    apiRequest(`/admin/services/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Admin Users API
 * Step 22: Users Management
 */
export const adminUsersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return apiRequest(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiRequest(`/admin/users/${id}`),
  update: (id, userData) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
  delete: (id) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Public Blog API
 * Step 23: Blog / Content Management System
 */
export const blogApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/blog${qs ? `?${qs}` : ''}`);
  },
  getBySlug: (slug) => apiRequest(`/blog/${slug}`),
};

/**
 * Admin Blog API
 * Step 23: Blog / Content Management System
 */
export const adminBlogApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/admin/blog${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => apiRequest(`/admin/blog/${id}`),
  create: (postData) =>
    apiRequest('/admin/blog', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),
  update: (id, postData) =>
    apiRequest(`/admin/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),
  delete: (id) =>
    apiRequest(`/admin/blog/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Admin Analytics API
 * Step 24: Real Analytics Foundation
 */
export const adminAnalyticsApi = {
  getOverview: (range = '7d') => apiRequest(`/admin/analytics/overview?range=${encodeURIComponent(range)}`),
};

/**
 * Public Site Settings API
 * Step 25: Site Settings & Configuration
 */
export const siteSettingsApi = {
  getSettings: () => apiRequest('/site-settings'),
};

/**
 * Admin Site Settings API
 * Step 25: Site Settings & Configuration
 */
export const adminSettingsApi = {
  getSettings: () => apiRequest('/admin/settings'),
  updateSettings: (settingsData) =>
    apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings: settingsData }),
    }),
};

/**
 * Public Global Search API
 * Step 26: Global Search System
 */
export const searchApi = {
  search: (query, type = 'all') => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type && type !== 'all') {
      params.append('type', type);
    }
    return apiRequest(`/search?${params.toString()}`);
  },
};

/**
 * Client Dashboard API
 * Step 27: Client Dashboard
 */
export const clientRequestsApi = {
  getAll: () => apiRequest('/client/project-requests'),
  getById: (id) => apiRequest(`/client/project-requests/${id}`),
};

/**
 * Health check service endpoints
 */
export const healthApi = {
  checkBackend: () => apiRequest('/health'),
  checkDatabase: () => apiRequest('/health/database'),
  checkSchema: () => apiRequest('/health/schema'),
};

/**
 * AI Project Assistant API endpoint
 * Step 38: Real Gemini AI Project Assistant
 */
export const aiApi = {
  generateProjectBrief: (message, context = null) =>
    apiRequest('/ai/project-assistant', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    }),
};

export default {
  API_BASE_URL,
  apiRequest,
  authApi,
  adminAuthApi,
  projectsApi,
  adminProjectsApi,
  projectRequestsApi,
  adminProjectRequestsApi,
  contactMessagesApi,
  adminMessagesApi,
  servicesApi,
  adminServicesApi,
  adminUsersApi,
  blogApi,
  adminBlogApi,
  adminAnalyticsApi,
  siteSettingsApi,
  adminSettingsApi,
  searchApi,
  clientRequestsApi,
  healthApi,
  aiApi,
};

