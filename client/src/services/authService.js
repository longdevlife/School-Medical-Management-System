import { authApi } from "../api/authApi";

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Helper function to map RoleID to role name
const mapRoleIdToName = (roleId) => {
  const roleMap = {
    1: "PARENT",
    2: "NURSE",
    3: "MANAGER",
    4: "ADMIN",
  };
  return roleMap[roleId] || "USER";
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

// Helper function to check if refresh token is expired
const isRefreshTokenExpired = (refreshToken) => {
  try {
    const payload = decodeToken(refreshToken);
    if (!payload || !payload.exp) return true;

    const currentTime = Date.now() / 1000;
    // Kiểm tra với buffer 5 phút để tránh race condition
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.error("Error checking refresh token expiration:", error);
    return true;
  }
};

// Helper function to handle logout and redirect to login
const handleTokenExpiration = () => {
  console.log("Token đã hết hạn, chuyển hướng đến trang đăng nhập");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Tránh redirect liên tục và chỉ redirect nếu không phải trang login
  if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
    console.log("Redirecting to login page...");
    window.location.href = "/login";
  }
};

// Biến để theo dõi quá trình refresh token
let isRefreshing = false;
let refreshPromise = null;

const authService = {
  login: async (username, password) => {
    try {
      console.log(`Attempting real API login for user: ${username}`);

      const response = await authApi.login({ username, password });

      console.log("API Response:", response.data);

      // Store token and decode user info from JWT
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        // Decode JWT token to get user info
        const tokenPayload = decodeToken(response.data.accessToken);
        console.log("Token payload:", tokenPayload);
        if (tokenPayload) {
          // Find role claim (backend uses Microsoft claims)
          const roleId = parseInt(
            tokenPayload[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] ||
              tokenPayload.role ||
              0
          );

          // Tìm username từ token hoặc sử dụng username đã nhập
          const username_from_token =
            tokenPayload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            ] ||
            tokenPayload[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/name"
            ] ||
            tokenPayload.name ||
            username;

          const user = {
            username: username_from_token,
            role: mapRoleIdToName(roleId),
          };

          console.log("RoleId:", roleId, "→ Role:", user.role);
          localStorage.setItem("user", JSON.stringify(user));
          console.log("Decoded user from token:", user);

          // Trả về dữ liệu kết hợp với user
          return {
            ...response.data,
            user: user,
          };
        }
      }

      console.log(`Real API login successful for user: ${username}`);
      return response.data;
    } catch (error) {
      console.error("Login API Error:", error);

      // Handle API errors
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.message || "Đăng nhập thất bại");
      } else if (error.request) {
        // Network error
        throw new Error("Không thể kết nối đến server");
      } else {
        // Other error
        throw new Error("Đã xảy ra lỗi không xác định");
      }
    }
  },

  logout: async () => {
    console.log("Logout Api");
    try {
      if (authApi.logout) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          await authApi.logout({ refreshToken });
        }
      }
    } catch (err) {
      console.warn("Logout API error (ignored):", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log("Token đã hết hạn, cần refresh");
      // Gọi ngay hàm xử lý hết hạn token
      handleTokenExpiration();
      return false;
    }

    return true;
  },

  // Add method to handle 401 errors
  handle401Error: () => {
    console.log("401 Không có quyền truy cập - Token đã hết hạn hoặc không hợp lệ");
    handleTokenExpiration();
  },

  // Add method to refresh token
  refreshToken: async () => {
    // Tránh multiple refresh requests
    if (isRefreshing) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = new Promise(async (resolve) => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.log("Không có refresh token");
          handleTokenExpiration();
          resolve(false);
          return;
        }

        // Kiểm tra refresh token có hết hạn không
        if (isRefreshTokenExpired(refreshToken)) {
          console.log("Refresh token đã hết hạn, cần đăng nhập lại");
          handleTokenExpiration();
          resolve(false);
          return;
        }

        console.log("Đang thực hiện refresh token...");
        const response = await authApi.refreshToken({ refreshToken });

        if (response.data.accessToken) {
          localStorage.setItem("token", response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
          console.log("Refresh token thành công");
          resolve(true);
        } else {
          console.log("Refresh token thất bại - không có accessToken");
          handleTokenExpiration();
          resolve(false);
        }
      } catch (error) {
        console.error("Làm mới token thất bại:", error);
        
        // Kiểm tra lỗi 401 hoặc 403 - refresh token không hợp lệ
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log("Refresh token không hợp lệ hoặc đã hết hạn");
        }
        
        handleTokenExpiration();
        resolve(false);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    });

    return refreshPromise;
  },

  // Kiểm tra token khi khởi động ứng dụng
  initializeAuth: async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    
    if (!token) {
      console.log("Không có token, người dùng chưa đăng nhập");
      return false;
    }

    // Kiểm tra token đã hết hạn chưa
    if (isTokenExpired(token)) {
      console.log("Token đã hết hạn, thử làm mới token");
      
      // Thử làm mới token nếu refresh token còn hiệu lực
      if (refreshToken && !isRefreshTokenExpired(refreshToken)) {
        const refreshSuccess = await authService.refreshToken();
        if (refreshSuccess) {
          console.log("Làm mới token thành công");
          return true;
        }
      } else {
        console.log("Refresh token đã hết hạn hoặc không tồn tại");
      }
      
      console.log("Không thể làm mới token, chuyển hướng đến trang đăng nhập");
      handleTokenExpiration();
      return false;
    }

    console.log("Token còn hiệu lực");
    return true;
  },

  // Kiểm tra token định kỳ (gọi mỗi 5 phút)
  startTokenCheck: () => {
    const checkInterval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        console.log("Token đã hết hạn trong lúc sử dụng");
        const refreshSuccess = await authService.refreshToken();
        if (!refreshSuccess) {
          clearInterval(checkInterval);
        }
      }
    }, 5 * 60 * 1000); // 5 phút

    return checkInterval;
  },

  // Dừng kiểm tra token định kỳ
  stopTokenCheck: (intervalId) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  },

  getRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.role.toUpperCase() : null;
  },
};

export default authService;
