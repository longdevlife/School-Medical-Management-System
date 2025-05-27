import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // URL base của API backend
  headers: {
    "Content-Type": "application/json", // Header mặc định
  },
});

export default api;
