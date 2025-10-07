import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API = `${API_BASE_URL}/api/helpdesk`;

const aiHelpService = {
  askHelp: async (query) => {
    const res = await axios.post(`${API}/ask`, { query });
    return res.data.response;
  }
};

export default aiHelpService;
