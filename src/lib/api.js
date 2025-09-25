import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : `${import.meta.env.VITE_API_URL}/api`; // ensure /api is included

console.log("API base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // using JWT, not cookies
});

// 🔑 Interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔑 Optional: auto-logout on 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // or use navigate if inside React
    }
    return Promise.reject(error);
  }
);

export default api;
