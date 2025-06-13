// Auth API endpoints
// TODO: Implement login, logout, refresh token APIs
import axiosClient from "./axiosClient";

export const authApi = {
  login: (credentials) => {
    // POST request với username/password
    return axiosClient.post("/Auth/login", credentials);
  },

  refreshToken: (token) => {
    // POST request với token cũ để lấy token mới
    return axiosClient.post("/Auth/refresh", { refreshToken: token });
  },

  logout: () => {
    // POST request để logout trên server
    return axiosClient.post("/Auth/logout");
  },
};