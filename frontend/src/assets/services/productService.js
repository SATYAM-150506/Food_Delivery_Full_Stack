import axios from 'axios';

const API = '/api/products';

const productService = {
  getAllProducts: async () => {
    const res = await axios.get(`${API}`);
    return res.data;
  }
};

export default productService;
