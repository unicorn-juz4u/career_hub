// client/src/services/api.js
// Centralized Axios API client with automatic JWT token attachment
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly error message handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract the server's error message if available
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please check your connection.';
    return Promise.reject(new Error(message));
  }
);

/* ================= AUTHENTICATION APIs ================= */

// Register a new user or employer
export const registerUser = async (formData) => {
  const response = await API.post('/auth/register', formData);
  return response.data;
};

// Login user / employer / admin
export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

// Fetch current user info using saved JWT
export const getCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

/* ================= DASHBOARD TEST APIs (Role Protected) ================= */

export const getUserDashboardData = async () => {
  const response = await API.get('/dashboard/user');
  return response.data;
};

export const getEmployerDashboardData = async () => {
  const response = await API.get('/dashboard/employer');
  return response.data;
};

export const getAdminDashboardData = async () => {
  const response = await API.get('/dashboard/admin');
  return response.data;
};

export default API;
