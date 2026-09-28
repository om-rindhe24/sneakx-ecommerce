import api from './api';

export const couponService = {
  // Customer validation
  validateCoupon: async (code, subtotal) => {
    const res = await api.post('/coupons/validate', { code, subtotal });
    return res.data;
  },

  // Admin coupon management
  getAdminCoupons: async () => {
    const res = await api.get('/admin/coupons');
    return res.data;
  },

  createAdminCoupon: async (couponData) => {
    const res = await api.post('/admin/coupons', couponData);
    return res.data;
  },

  updateAdminCoupon: async (id, couponData) => {
    const res = await api.put(`/admin/coupons/${id}`, couponData);
    return res.data;
  },

  toggleAdminCoupon: async (id) => {
    const res = await api.patch(`/admin/coupons/${id}/toggle`);
    return res.data;
  },

  deleteAdminCoupon: async (id) => {
    const res = await api.delete(`/admin/coupons/${id}`);
    return res.data;
  }
};
