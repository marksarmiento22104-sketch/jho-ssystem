import axios from 'axios';

// In production, VITE_API_URL points to the backend URL
// In local dev, it's empty so Vite's proxy in vite.config.js handles /api requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Add CSRF token to all requests
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add response interceptor for handling errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 419) {
      // Handle unauthenticated user
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;