import axios from 'axios';

const API = axios.create({
  baseURL: 'https://star-aviation-backend-production.up.railway.app/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
// const API = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   headers: { 'Content-Type': 'application/json' },
// });
// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const loginAPI = (data) => API.post('/auth/login', data);
export const registerAPI = (data) => API.post('/auth/register', data);
export const getMeAPI = () => API.get('/auth/me');

// ── Products ──
export const getProductsAPI = (params) => API.get('/products', { params });
export const getProductByIdAPI = (id) => API.get(`/products/${id}`);
export const getProductByBarcodeAPI = (code) => API.get(`/products/barcode/${code}`);
export const getExpiringAPI = (days) => API.get(`/products/expiring?days=${days}`);
export const createProductAPI = (data) => API.post('/products', data);
export const updateProductAPI = (id, data) => API.put(`/products/${id}`, data);
export const deleteProductAPI = (id) => API.delete(`/products/${id}`);
export const adjustStockAPI = (id, adjustment) => API.patch(`/products/${id}/stock`, { adjustment });

// ── Scan ──
export const scanLookupAPI = (barcode) => API.get(`/scan/lookup/${barcode}`);
export const scanStockInAPI = (data) => API.post('/scan/stock-in', data);
export const scanStockOutAPI = (data) => API.post('/scan/stock-out', data);

// ── Dashboard ──
export const getDashboardSummaryAPI = () => API.get('/dashboard/summary');
export const getExpiryTimelineAPI = () => API.get('/dashboard/expiry-timeline');
export const getStockLevelsAPI = () => API.get('/dashboard/stock-levels');
export const getRecentActivityAPI = (limit) => API.get(`/dashboard/recent-activity?limit=${limit || 20}`);

// ── Notifications ──
export const getNotificationsAPI = (params) => API.get('/notifications', { params });
export const getUnreadCountAPI = () => API.get('/notifications/unread-count');
export const markReadAPI = (id) => API.patch(`/notifications/${id}/read`);
export const markAllReadAPI = () => API.patch('/notifications/read-all');

// ── Audit Logs ──
export const getAuditLogsAPI = (params) => API.get('/audit-logs', { params });

// ── Tool Issues ──
export const getToolIssuesAPI = (params) => API.get('/tool-issues', { params });
export const createToolIssueAPI = (data) => API.post('/tool-issues', data);
export const returnToolIssueAPI = (id, data) => API.put(`/tool-issues/${id}/return`, data);

export default API;
