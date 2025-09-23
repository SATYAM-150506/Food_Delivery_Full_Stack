import axios from 'axios';

const API = '/api/helpdesk';

const aiHelpService = {
  askHelp: async (query) => {
    const res = await axios.post(`${API}/ask`, { query });
    return res.data.response;
  }
};

export default aiHelpService;
