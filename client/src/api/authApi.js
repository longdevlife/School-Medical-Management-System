
// Auth API endpoints
// TODO: Implement login, logout, refresh token APIs
import axiosClient from "./axiosClient";

export const authApi = {
  login: (credentials) => {
    // POST request với username/password
    return axiosClient.post("/auth/login", credentials);
  },

  googleLogin: (data) => {
    return axiosClient.post("/auth/google-login", data);
  },

  refreshToken: (token) => {
    // POST request với token cũ để lấy token mới
    return axiosClient.post("/auth/refresh", { refreshToken: token });
  },

  forgotPassword: (data) => {
    // POST request để gửi yêu cầu quên mật khẩu
    return axiosClient.post("/auth/forgot-password", data);
  },
  resetPassword: (data) => {
    // POST request để đặt lại mật khẩu
    return axiosClient.post("/auth/reset-password", data);
  },
  logout: () => {
    // POST request để logout trên server
    return axiosClient.post("/auth/logout");
  },
};
