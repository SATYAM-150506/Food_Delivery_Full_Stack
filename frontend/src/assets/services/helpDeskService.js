import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/helpdesk';

// Create axios instance with common config
const helpDeskAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically
helpDeskAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const helpDeskService = {
  // Create a help desk ticket
  createTicket: async (ticketData) => {
    try {
      console.log('Creating help desk ticket:', ticketData);
      const response = await helpDeskAPI.post('/create', ticketData);
      console.log('Help desk ticket created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create ticket error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's help desk tickets
  getMyTickets: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const queryString = params.toString();
      const url = queryString ? `/my-tickets?${queryString}` : '/my-tickets';
      
      console.log('Fetching user tickets with filters:', filters);
      const response = await helpDeskAPI.get(url);
      console.log('User tickets fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get my tickets error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get specific ticket details
  getTicket: async (ticketId) => {
    try {
      console.log('Fetching ticket:', ticketId);
      const response = await helpDeskAPI.get(`/ticket/${ticketId}`);
      console.log('Ticket details fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get ticket error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add response to ticket
  addResponse: async (ticketId, message) => {
    try {
      console.log('Adding response to ticket:', ticketId, message);
      const response = await helpDeskAPI.post(`/ticket/${ticketId}/response`, { message });
      console.log('Response added:', response.data);
      return response.data;
    } catch (error) {
      console.error('Add response error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default helpDeskService;
