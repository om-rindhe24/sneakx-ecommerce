import api from './api';

export const orderService = {
  checkout: async (checkoutData) => {
    const res = await api.post('/orders/checkout', checkoutData);
    return res.data;
  },

  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  getOrderByNumber: async (orderNumber) => {
    try {
      const res = await api.get('/orders');
      const orders = res.data?.data || res.data || [];
      const found = orders.find(o => o.orderNumber === orderNumber);
      return found || null;
    } catch (err) {
      console.error('Failed to fetch order by number', err);
      return null;
    }
  }
};
