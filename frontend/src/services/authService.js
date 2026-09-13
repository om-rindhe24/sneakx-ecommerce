import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('sneakx_token', res.data.token);
      localStorage.setItem('sneakx_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('sneakx_token', res.data.token);
      localStorage.setItem('sneakx_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('sneakx_token');
    localStorage.removeItem('sneakx_user');
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem('sneakx_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getStoredToken: () => {
    return localStorage.getItem('sneakx_token');
  }
};
