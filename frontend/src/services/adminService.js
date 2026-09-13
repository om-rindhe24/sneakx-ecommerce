import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/admin/products', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/admin/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },

  updateVariantStock: async (variantId, stockQuantity) => {
    const res = await api.put(`/admin/variants/${variantId}/stock`, { stockQuantity });
    return res.data;
  },

  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  getAllOrders: async (page = 0, pageSize = 10) => {
    const res = await api.get('/admin/orders', { params: { page, pageSize } });
    return res.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await api.put(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  }
};
