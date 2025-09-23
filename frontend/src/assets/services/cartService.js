import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance for cart API
const cartAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests automatically
cartAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const cartService = {
  getCart: async () => {
    try {
      const res = await cartAPI.get('/api/cart');
      console.log('✅ Cart fetched from backend:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error.response?.data || error.message);
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await cartAPI.post('/api/cart/add', { productId, quantity });
      console.log('✅ Item added to cart:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to add to cart:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCart: async (items) => {
    try {
      const res = await cartAPI.post('/api/cart', { items });
      console.log('✅ Cart updated:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to update cart:', error.response?.data || error.message);
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      const res = await cartAPI.put('/api/cart/update', { productId, quantity });
      console.log('✅ Cart item updated:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to update cart item:', error.response?.data || error.message);
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    try {
      const res = await cartAPI.delete(`/api/cart/remove/${productId}`);
      console.log('✅ Item removed from cart:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to remove from cart:', error.response?.data || error.message);
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const res = await cartAPI.delete('/api/cart/clear');
      console.log('✅ Cart cleared:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Failed to clear cart:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default cartService;
