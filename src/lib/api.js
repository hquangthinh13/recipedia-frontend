import axios from "axios";

// pick the right base URL depending on env
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api" // local backend
    : import.meta.env.VITE_API_URL ||
      "https://recipedia-backend.onrender.com/api"; // deployed backend

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // if you send cookies/JWT
});

export default api;
