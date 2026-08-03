import axiosClient, { unwrapPage } from './axiosClient';

export const notificationApi = {
  list: (params) => unwrapPage(axiosClient.get('/notifications', { params })),
  markAsRead: (id) => axiosClient.patch(`/notifications/${id}/read`).then((res) => res.data.data),
  markAllAsRead: () => axiosClient.patch('/notifications/read-all').then((res) => res.data.data),
};
