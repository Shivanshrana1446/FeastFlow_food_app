import axiosClient, { unwrap, unwrapPage } from './axiosClient';

export const restaurantApi = {
  list: (params) => unwrapPage(axiosClient.get('/restaurants', { params })),
  listMine: () => unwrap(axiosClient.get('/restaurants/mine')),
  getById: (id) => unwrap(axiosClient.get(`/restaurants/${id}`)),
  getMenu: (id, params) => unwrap(axiosClient.get(`/restaurants/${id}/menu`, { params })),
  create: (payload) => unwrap(axiosClient.post('/restaurants', payload)),
  update: (id, payload) => unwrap(axiosClient.patch(`/restaurants/${id}`, payload)),
  remove: (id) => unwrap(axiosClient.delete(`/restaurants/${id}`)),
  // No explicit Content-Type here — axios's XHR adapter (the one browsers actually use) does not
  // append a boundary to a manually-set 'multipart/form-data' header, which busboy/multer then
  // reject outright ("Multipart: Boundary not found"). Omitting the header lets the browser set
  // 'multipart/form-data; boundary=...' itself when it sees a FormData body.
  uploadImages: (id, formData) => unwrap(axiosClient.patch(`/restaurants/${id}/images`, formData)),
  getDashboard: (id) => unwrap(axiosClient.get(`/restaurants/${id}/dashboard`)),

  listCategories: (restaurantId) => unwrap(axiosClient.get('/categories', { params: { restaurant: restaurantId } })),
  createCategory: (payload) => unwrap(axiosClient.post('/categories', payload)),
  updateCategory: (id, payload) => unwrap(axiosClient.patch(`/categories/${id}`, payload)),
  deleteCategory: (id) => unwrap(axiosClient.delete(`/categories/${id}`)),
};
