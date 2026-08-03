/**
 * Access tokens live in memory only (never localStorage) — the refresh token
 * is an httpOnly cookie the browser handles automatically, so a page reload
 * re-derives a fresh access token via POST /auth/refresh-token instead of
 * persisting anything readable by injected scripts.
 */
let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const clearAccessToken = () => {
  accessToken = null;
};
