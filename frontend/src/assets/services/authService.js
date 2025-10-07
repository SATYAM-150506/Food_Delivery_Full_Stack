import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Debug logging
console.log('🔧 Auth Service Configuration:');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Create axios instance specifically for auth
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token from responses
authAPI.interceptors.response.use(
  (response) => {
    // Store token from login response
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error) => {
    // Clear token on 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

const authService = {
  login: async (credentials) => {
    try {
      const res = await authAPI.post('/api/auth/login', credentials);
      console.log('Login response:', res.data);
      
      // Store the token
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      return res.data.user;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },
  signup: async (data) => {
    try {
      const res = await authAPI.post('/api/auth/signup', data);
      console.log('Signup response:', res.data);
      return res.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const res = await authAPI.get('/api/auth/profile');
      return res.data;
    } catch (error) {
      console.log('Get current user failed:', error.response?.status);
      throw error;
    }
  },
  logout: async () => {
    try {
      await authAPI.post('/api/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear token even if server logout fails
      localStorage.removeItem('token');
    }
  },
  getAllUsers: async () => {
    const res = await authAPI.get('/api/auth/users');
    return res.data.users;
  },
  deleteUser: async (userId) => {
    await authAPI.delete(`/api/auth/users/${userId}`);
  },
  updateProfile: async (data) => {
    await authAPI.put('/api/auth/profile', data);
  }
};

export default authService;
