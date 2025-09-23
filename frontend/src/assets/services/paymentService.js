import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance for payments with proper auth configuration
const paymentAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests automatically
paymentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle auth errors
paymentAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

const API = '/api/payment';

const paymentService = {
  // Create Razorpay order
  createPaymentOrder: async (data) => {
    const res = await paymentAPI.post(`${API}/create-order`, data);
    return res.data;
  },

  // Process payment (create order)
  processPayment: async (data) => {
    const res = await paymentAPI.post(`${API}/pay`, data);
    return res.data;
  },

  // Verify payment after successful transaction
  verifyPayment: async (data) => {
    const res = await paymentAPI.post(`${API}/verify`, data);
    return res.data;
  },

  // Handle payment failure
  paymentFailed: async (data) => {
    const res = await paymentAPI.post(`${API}/failed`, data);
    return res.data;
  },

  // Initialize Razorpay payment
  initiateRazorpayPayment: (options) => {
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        ...options,
        handler: function (response) {
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled by user'));
          }
        }
      });
      rzp.open();
    });
  }
};

export default paymentService;
