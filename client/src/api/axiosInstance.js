import axios from 'axios';

// Create configured Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000
});

// Interceptor: Automatically attach JWT token from localStorage to request headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('otess_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Centralized Response & Error Handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if session expired or unauthorized
      localStorage.removeItem('otess_token');
      localStorage.removeItem('otess_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
