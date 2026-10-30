const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('creativedesk_token');
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  forgotPassword: (email) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (data) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Dashboard Stats
  getDashboardStats: () => apiRequest('/dashboard/stats'),
  getPortalStats: () => apiRequest('/portal/stats'),

  // Clients
  getClients: (params = '') => apiRequest(`/clients${params}`),
  getClientById: (id) => apiRequest(`/clients/${id}`),
  createClient: (data) => apiRequest('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id, data) => apiRequest(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id) => apiRequest(`/clients/${id}`, { method: 'DELETE' }),

  // Requests
  getRequests: (params = '') => apiRequest(`/requests${params}`),
  createRequest: (data) => apiRequest('/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequest: (id, data) => apiRequest(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  convertRequest: (id) => apiRequest(`/requests/${id}/convert`, { method: 'POST' }),

  // Projects
  getProjects: (params = '') => apiRequest(`/projects${params}`),
  getProjectById: (id) => apiRequest(`/projects/${id}`),
  createProject: (data) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id, data) => apiRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' }),

  // Artwork & Revisions
  getArtworks: (params = '') => apiRequest(`/artworks${params}`),
  uploadArtwork: (data) => apiRequest('/artworks', { method: 'POST', body: JSON.stringify(data) }),
  updateArtworkStatus: (id, data) => apiRequest(`/artworks/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getRevisions: (params = '') => apiRequest(`/revisions${params}`),

  // Invoices & Financials
  getInvoices: (params = '') => apiRequest(`/invoices${params}`),
  createInvoice: (data) => apiRequest('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  getPayments: () => apiRequest('/payments'),
  recordPayment: (data) => apiRequest('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' })
};
