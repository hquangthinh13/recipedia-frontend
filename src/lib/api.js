import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5001/api'
    : `${import.meta.env.VITE_API_URL}/api`;

// console.log('API base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // using JWT, not cookies
});

// Interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Simple flag to avoid spamming multiple 429 toasts at once
let showingRateLimitToast = false;

// Auto-logout on 401/403 + global 429 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 429) {
      const msg = error.response?.data?.message || 'Too many requests, try again later.';
      if (!showingRateLimitToast) {
        showingRateLimitToast = true;
        toast.error(msg, {
          onDismiss: () => {
            showingRateLimitToast = false;
          },
        });
      }
      // Do NOT logout, just inform user; still reject so callers know the request failed
      return Promise.reject(error);
    }

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      // window.location.href = '/login';
      toast.error('Session expired. Please log in again.');
    }

    return Promise.reject(error);
  },
);
export default api;
