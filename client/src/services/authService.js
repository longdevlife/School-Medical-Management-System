// eslint-disable-next-line no-unused-vars
import axiosClient from "../api/axiosClient";

const authService = {
  // eslint-disable-next-line no-unused-vars
  login: async (username, password) => {
    // --- START MOCK LOGIN LOGIC (REMOVE WHEN BACKEND API IS READY) ---
    console.log(`Attempting mock login for user: ${username}`);
    // Simulate a delay to mimic network request
    await new Promise((resolve) => setTimeout(resolve, 500));

    let mockUser = null;
    let mockToken = "fake-token-" + username; // Generate a dummy token

    switch (username.toLowerCase()) {
      case "nurse":
        mockUser = { id: "nurse-123", username: "nurse", role: "NURSE" };
        break;
      case "manager":
        mockUser = { id: "manager-456", username: "manager", role: "MANAGER" };
        break;
      case "parent":
        mockUser = { id: "parent-789", username: "parent", role: "PARENT" };
        break;
      default: {
        // Simulate login failure
        const error = new Error("Invalid username or password");
        error.response = {
          status: 401,
          data: { message: "Invalid credentials" },
        };
        throw error;
      }
    }

    // Simulate successful login response
    const responseData = { token: mockToken, user: mockUser };

    // Store mock token and user in localStorage
    localStorage.setItem("token", mockToken);
    localStorage.setItem("user", JSON.stringify(mockUser));

    console.log(`Mock login successful for user: ${username}`);
    return responseData; // Return mock response data
    // --- END MOCK LOGIN LOGIC ---

    /*
    // --- ORIGINAL API CALL LOGIC (UNCOMMENT WHEN BACKEND API IS READY) ---
    // try {
    //   const response = await api.post('/auth/login', { username, password });
    //   if (response.data.token) {
    //     localStorage.setItem('token', response.data.token);
    //     localStorage.setItem('user', JSON.stringify(response.data.user));
    //   }
    //   return response.data;
    // } catch (error) {
    //   throw error;
    // }
    // --- END ORIGINAL API CALL LOGIC ---
    */
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
    // Ensure role is in uppercase to match ProtectedRoute logic
    return user ? user.role.toUpperCase() : null;
  },
};

export default authService;
