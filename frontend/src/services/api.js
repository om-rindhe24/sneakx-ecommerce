import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sneakx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If 401 Unauthorized, clear stale token
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sneakx_token');
      localStorage.removeItem('sneakx_user');
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const errors = error.response?.data?.errors;
    return Promise.reject({ message, errors, status: error.response?.status });
  }
);

export default api;
