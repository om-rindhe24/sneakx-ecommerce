import api from './api';

export const addressService = {
  getAddresses: async () => {
    const res = await api.get('/addresses');
    return res.data;
  },

  createAddress: async (addressData) => {
    const res = await api.post('/addresses', addressData);
    return res.data;
  },

  updateAddress: async (id, addressData) => {
    const res = await api.put(`/addresses/${id}`, addressData);
    return res.data;
  },

  deleteAddress: async (id) => {
    const res = await api.delete(`/addresses/${id}`);
    return res.data;
  },

  setDefaultAddress: async (id) => {
    const res = await api.patch(`/addresses/${id}/default`);
    return res.data;
  }
};
