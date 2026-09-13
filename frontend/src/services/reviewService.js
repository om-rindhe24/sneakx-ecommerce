import api from './api';

export const reviewService = {
  getProductReviews: async (productId) => {
    const res = await api.get(`/products/${productId}/reviews`);
    return res.data;
  },

  addReview: async (productId, reviewData) => {
    const res = await api.post(`/products/${productId}/reviews`, reviewData);
    return res.data;
  }
};
