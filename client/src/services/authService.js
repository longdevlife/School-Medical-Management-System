import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  isAuthenticated: () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return !!user && !!user.token;
  },
};

export default authService;
