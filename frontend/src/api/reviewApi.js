import axiosClient, { unwrap, unwrapPage } from './axiosClient';

export const reviewApi = {
  list: (params) => unwrapPage(axiosClient.get('/reviews', { params })),
  create: (payload) => unwrap(axiosClient.post('/reviews', payload)),
};
