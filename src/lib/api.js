import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : import.meta.env.VITE_API_URL; // just the value

console.log("API base URL:", BASE_URL); // 🔍 Debug log

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
