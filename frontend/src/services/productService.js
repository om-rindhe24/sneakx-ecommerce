import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  getProductBySlug: async (slug) => {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data;
  },

  getFeatured: async () => {
    const res = await api.get('/products/featured');
    return res.data;
  },

  getNewReleases: async () => {
    const res = await api.get('/products/new-releases');
    return res.data;
  },

  getBrands: async () => {
    const res = await api.get('/brands');
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  }
};
