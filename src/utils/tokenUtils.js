import { jwtDecode } from "jwt-decode";

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);

    if (!decoded.exp) return false;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (err) {
    return true;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("userInfo");
  window.location.href = "/login";
};