import axiosClient, { unwrap, unwrapPage } from './axiosClient';

export const menuApi = {
  list: (params) => unwrapPage(axiosClient.get('/menu-items', { params })),
  getById: (id) => unwrap(axiosClient.get(`/menu-items/${id}`)),
  create: (payload) => unwrap(axiosClient.post('/menu-items', payload)),
  update: (id, payload) => unwrap(axiosClient.patch(`/menu-items/${id}`, payload)),
  remove: (id) => unwrap(axiosClient.delete(`/menu-items/${id}`)),
  // See the comment on restaurantApi.uploadImages — no manual Content-Type here either.
  uploadImage: (id, formData) => unwrap(axiosClient.patch(`/menu-items/${id}/image`, formData)),
};
