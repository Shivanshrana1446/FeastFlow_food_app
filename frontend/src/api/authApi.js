import axiosClient, { unwrap } from './axiosClient';

export const authApi = {
  register: (payload) => unwrap(axiosClient.post('/auth/register', payload)),
  login: (payload) => unwrap(axiosClient.post('/auth/login', payload)),
  logout: () => unwrap(axiosClient.post('/auth/logout')),
  refreshToken: () => unwrap(axiosClient.post('/auth/refresh-token')),
  getMe: () => unwrap(axiosClient.get('/auth/me')),
};
