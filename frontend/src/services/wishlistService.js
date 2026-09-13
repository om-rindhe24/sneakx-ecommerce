import api from './api';

export const wishlistService = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },

  toggle: async (productId) => {
    const res = await api.post(`/wishlist/toggle/${productId}`);
    return res.data;
  },

  check: async (productId) => {
    const res = await api.get(`/wishlist/check/${productId}`);
    return res.data;
  }
};
