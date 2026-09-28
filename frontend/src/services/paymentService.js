import api from './api';

export const paymentService = {
  /**
   * Creates a Razorpay order on backend.
   * @param {number} amount - Amount in INR (optional; falls back to cart total if omitted)
   * @returns {Promise<{ orderId: string, amount: number, amountInPaise: number, currency: string, keyId: string }>}
   */
  createOrder: async (amount, couponCode) => {
    const payload = {};
    if (amount) payload.amount = amount;
    if (couponCode) payload.couponCode = couponCode;
    const res = await api.post('/payments/create-order', payload);
    return res.data?.data || res.data;
  },

  /**
   * Verifies Razorpay payment signature and completes checkout atomically.
   * @param {{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, addressId?: number, newAddress?: object, orderId?: number }} verificationData
   * @returns {Promise<object>} Confirmed order object
   */
  verifyPayment: async (verificationData) => {
    const res = await api.post('/payments/verify', verificationData);
    return res.data?.data || res.data;
  }
};
