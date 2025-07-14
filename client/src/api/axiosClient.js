import axios from "axios";
import { authApi } from "./authApi";

const axiosClient = axios.create({
  baseURL: "https://localhost:7040/api/",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    if (config.url?.includes("google-login")) {
      console.log("🚀 AXIOS REQUEST DEBUG:");

      console.log("Method:", config.method);
      console.log("Headers:", config.headers);
      console.log("Data:", config.data);
      console.log("Data stringified:", JSON.stringify(config.data));
      console.log("Client UTC Time:", new Date().toISOString());
    }
    console.log("Client UTC Time:", new Date().toISOString());

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

    // Chỉ xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Nếu có refreshToken và chưa retry, thử refresh
      if (!originalRequest._retry && localStorage.getItem("refreshToken")) {
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
        } catch (refreshError) {
          // Refresh token thất bại hoặc hết hạn
          processQueue(refreshError, null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");

          // Redirect về login
          window.location.replace("/login");
          return new Promise(() => {}); // Treo promise để ngăn code chạy tiếp
        } finally {
          isRefreshing = false;
        }
      } else {
        // Không có refreshToken hoặc đã retry rồi => logout luôn
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        // Redirect về login
        window.location.replace("/login");
        return new Promise(() => {}); // Treo promise để ngăn code chạy tiếp
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
