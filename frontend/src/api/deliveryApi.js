import axiosClient, { unwrap, unwrapPage } from './axiosClient';

export const deliveryApi = {
  getProfile: () => unwrap(axiosClient.get('/delivery/profile')),
  updateProfile: (payload) => unwrap(axiosClient.patch('/delivery/profile', payload)),
  setAvailability: (isAvailable) => unwrap(axiosClient.patch('/delivery/availability', { isAvailable })),
  setLocation: (coordinates) => unwrap(axiosClient.patch('/delivery/location', { coordinates })),

  listAvailable: (params) => unwrapPage(axiosClient.get('/delivery/orders/available', { params })),
  listAssigned: (params) => unwrapPage(axiosClient.get('/delivery/orders/assigned', { params })),
  listHistory: (params) => unwrapPage(axiosClient.get('/delivery/orders/history', { params })),

  accept: (orderId) => unwrap(axiosClient.patch(`/delivery/orders/${orderId}/accept`)),
  pickedUp: (orderId) => unwrap(axiosClient.patch(`/delivery/orders/${orderId}/picked-up`)),
  outForDelivery: (orderId) => unwrap(axiosClient.patch(`/delivery/orders/${orderId}/out-for-delivery`)),
  delivered: (orderId) => unwrap(axiosClient.patch(`/delivery/orders/${orderId}/delivered`)),
};
