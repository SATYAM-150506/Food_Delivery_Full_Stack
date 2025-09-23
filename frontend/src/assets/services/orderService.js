import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance for orders with proper auth configuration
const orderAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests automatically
orderAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth errors
orderAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

const API = '/api/orders';

const orderService = {
  createOrder: async (orderData) => {
    try {
      // Try the /create route first, fall back to base route
      let res;
      try {
        res = await orderAPI.post(`${API}/create`, orderData);
      } catch (error) {
        if (error.response?.status === 404) {
          // Try base route if /create doesn't exist
          res = await orderAPI.post(`${API}`, orderData);
        } else {
          throw error;
        }
      }
      return res.data;
    } catch (error) {
      console.error('Create order error:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed. User might need to login again.');
      }
      throw error;
    }
  },
  
  getOrders: async () => {
    try {
      const res = await orderAPI.get(`${API}/my-orders`);
      // Backend returns { orders: [], totalPages, currentPage, total }
      return res.data.orders || [];
    } catch (error) {
      console.error('Get orders error:', error);
      // Return empty array on error to prevent .map() issues
      return [];
    }
  },
  
  getOrderById: async (orderId) => {
    try {
      const res = await orderAPI.get(`${API}/${orderId}`);
      return res.data;
    } catch (error) {
      console.error('Get order by ID error:', error);
      throw error;
    }
  },

  // Update order details
  updateOrder: async (orderId, updateData) => {
    try {
      const res = await orderAPI.put(`${API}/${orderId}`, updateData);
      return res.data;
    } catch (error) {
      console.error('Update order error:', error);
      throw error;
    }
  },
  
  // Legacy methods for backward compatibility
  placeOrder: async (orderData) => {
    const res = await orderService.createOrder(orderData);
    return res.order;
  },
  
  getAllOrders: async () => {
    const res = await orderService.getOrders();
    return res;
  },
  
  updateOrderStatus: async (orderId, status) => {
    try {
      await axios.put(`${API}/${orderId}/status`, { status });
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  },

  trackOrder: async (orderId) => {
    try {
      const res = await axios.get(`${API}/${orderId}/track`);
      return res.data;
    } catch (error) {
      console.error('Track order error:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId, reason) => {
    try {
      const res = await axios.put(`${API}/${orderId}/cancel`, { reason });
      return res.data;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  rateOrder: async (orderId, rating, review) => {
    try {
      const res = await axios.post(`${API}/${orderId}/rate`, { rating, review });
      return res.data;
    } catch (error) {
      console.error('Rate order error:', error);
      throw error;
    }
  }
};

export default orderService;
