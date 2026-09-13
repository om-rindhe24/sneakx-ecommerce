import api from './api';

export const recommendationService = {
  getSimilar: async (productId, limit = 4) => {
    const res = await api.get(`/recommendations/products/${productId}`, { params: { limit } });
    return res.data;
  },

  getUserRecommendations: async (limit = 4) => {
    const res = await api.get('/recommendations/user', { params: { limit } });
    return res.data;
  },

  getSizeRecommendation: async (targetProductId, referenceBrand, referenceSize) => {
    const res = await api.post('/recommendations/size-advisor', {
      targetProductId,
      referenceBrand,
      referenceSize: parseFloat(referenceSize)
    });
    return res.data;
  }
};
