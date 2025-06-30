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

const authService = {
  login: async (username, password) => {
    try {
      console.log(`Attempting real API login for user: ${username}`);

      // Call real backend API
      const response = await authApi.login({ username, password });

      console.log("API Response:", response.data);

      // Store token and decode user info from JWT
      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);

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

          // Find username claim (backend uses XMLSoap claims)
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

          // Return user info along with tokens for Login.jsx
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

  logout: () => {
    console.log("Mock logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  getRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.role.toUpperCase() : null;
  },
};

export default authService;
