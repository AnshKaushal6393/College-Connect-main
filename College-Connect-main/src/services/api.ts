import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // You can add loading state here if needed
    return config;
  },
  (error) => {
    toast.error('Request failed to send');
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout - Please try again');
    } else if (!error.response) {
      toast.error('Network error - Check your connection');
    } else {
      const status = error.response.status;
      const message = error.response.data?.error || 'Something went wrong';

      switch (status) {
        case 401:
          toast.error('Session expired. Please login again');
          // Clear any auth state
          localStorage.removeItem('user');
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          break;
        case 403:
          toast.error('Access denied');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error - Please try again later');
          break;
        default:
          toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
