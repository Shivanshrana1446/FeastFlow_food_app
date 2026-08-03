import axiosClient, { unwrap } from './axiosClient';

export const userApi = {
  getUser: (id) => unwrap(axiosClient.get(`/users/${id}`)),
  updateUser: (id, payload) => unwrap(axiosClient.patch(`/users/${id}`, payload)),
  addAddress: (payload) => unwrap(axiosClient.post('/users/me/addresses', payload)),
  updateAddress: (addressId, payload) => unwrap(axiosClient.patch(`/users/me/addresses/${addressId}`, payload)),
  removeAddress: (addressId) => unwrap(axiosClient.delete(`/users/me/addresses/${addressId}`)),
};
