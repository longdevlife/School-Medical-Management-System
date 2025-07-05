import axios from "axios";
import { authApi } from "./authApi"; // Thêm dòng này

const axiosClient = axios.create({
  baseURL: "https://localhost:7040/api/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý token refresh
let isRefreshing = false;
let failedQueue = [];

// Khi token được làm mới, sẽ giải quyết tất cả các promise trong hàng đợi

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Thêm interceptor cho phản hồi
// Nếu bị lỗi 401 (Unauthorized), sẽ làm mới token

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      if (isRefreshing) {
        // Nếu đang refresh, chờ refresh xong rồi retry
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await authApi.refreshToken(refreshToken);
        const newToken = res.data.token;
        // Lưu token mới vào localStorage
        localStorage.setItem("token", newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = "Bearer " + newToken;
        return axiosClient(originalRequest);

        // Nếu refresh token không thành công, xóa token và chuyển hướng đến trang đăng nhập
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;