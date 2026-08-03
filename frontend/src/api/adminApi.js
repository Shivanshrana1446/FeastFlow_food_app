import axiosClient, { unwrap, unwrapPage } from './axiosClient';

export const adminApi = {
  getDashboard: () => unwrap(axiosClient.get('/admin/dashboard')),

  listUsers: (params) => unwrapPage(axiosClient.get('/admin/users', { params })),
  listCustomers: (params) => unwrapPage(axiosClient.get('/admin/users', { params: { ...params, role: 'customer' } })),
  setUserStatus: (id, isActive) => unwrap(axiosClient.patch(`/admin/users/${id}/status`, { isActive })),

  listRestaurants: (params) => unwrapPage(axiosClient.get('/admin/restaurants', { params })),
  setRestaurantApproval: (id, isApproved) =>
    unwrap(axiosClient.patch(`/admin/restaurants/${id}/approve`, { isApproved })),

  listDeliveryPartners: (params) => unwrapPage(axiosClient.get('/admin/delivery-partners', { params })),
};
