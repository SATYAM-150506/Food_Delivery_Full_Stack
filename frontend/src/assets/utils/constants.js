export const API_BASE_URL = '/api';

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const formatCurrency = (amount) => {
  return `₹${amount}`;
};
