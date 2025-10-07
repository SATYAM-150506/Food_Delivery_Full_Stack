import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API = `${API_BASE_URL}/api/products`;

const productService = {
  getAllProducts: async () => {
    const res = await axios.get(`${API}`);
    return res.data;
  }
};

export default productService;
