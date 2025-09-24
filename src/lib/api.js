import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : `${import.meta.env.VITE_API_URL}/api`; // ensure /api is included

console.log("API base URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // set to false if you use JWT in headers instead of cookies
});

export default api;
