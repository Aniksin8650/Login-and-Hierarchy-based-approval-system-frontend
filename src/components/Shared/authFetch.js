import { getToken, isTokenExpired, logout } from "../../utils/tokenUtils";

export const authFetch = async (url, options = {}) => {
  const token = getToken();

  if (isTokenExpired()) {
    logout();
    return Promise.reject("Token expired");
  }

  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : undefined,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    logout();
  }

  return response;
};