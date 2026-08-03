import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenManager';

export const AUTH_LOGOUT_EVENT = 'auth:force-logout';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

function requestRefresh() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthRoute = config?.url?.startsWith('/auth/');

    if (response?.status === 401 && config && !config._retried && !isAuthRoute) {
      config._retried = true;
      try {
        const { data } = await requestRefresh();
        setAccessToken(data.data.accessToken);
        config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosClient(config);
      } catch (refreshError) {
        clearAccessToken();
        window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** Unwraps { success, data } and returns just the payload. */
export const unwrap = (promise) => promise.then((res) => res.data.data);

/** Returns { data, meta } for paginated list endpoints. */
export const unwrapPage = (promise) => promise.then((res) => ({ data: res.data.data, meta: res.data.meta }));

export default axiosClient;
