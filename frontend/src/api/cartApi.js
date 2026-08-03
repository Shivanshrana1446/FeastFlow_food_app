import axiosClient, { unwrap } from './axiosClient';

export const cartApi = {
  getCart: () => unwrap(axiosClient.get('/cart')),
  addItem: (payload) => unwrap(axiosClient.post('/cart/items', payload)),
  updateItem: (itemId, payload) => unwrap(axiosClient.patch(`/cart/items/${itemId}`, payload)),
  removeItem: (itemId) => unwrap(axiosClient.delete(`/cart/items/${itemId}`)),
  clearCart: () => unwrap(axiosClient.delete('/cart')),
};
