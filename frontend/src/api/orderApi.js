import axiosClient, { unwrap, unwrapPage } from './axiosClient';

export const orderApi = {
  placeOrder: (payload) => unwrap(axiosClient.post('/orders', payload)),
  list: (params) => unwrapPage(axiosClient.get('/orders', { params })),
  getById: (id) => unwrap(axiosClient.get(`/orders/${id}`)),
  updateStatus: (id, payload) => unwrap(axiosClient.patch(`/orders/${id}/status`, payload)),
  getPayment: (id) => unwrap(axiosClient.get(`/payments/${id}`)),
  verifyRazorpayPayment: (payload) => unwrap(axiosClient.post('/payments/razorpay/verify', payload)),
};
