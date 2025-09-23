import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Configure axios to send credentials with all requests
axios.defaults.withCredentials = true;

// Disable MetaMask and other wallet injections for this food delivery app
// This prevents wallet extensions from interfering with our Razorpay payments
if (typeof window !== 'undefined') {
  // Disable MetaMask auto-connection
  if (window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false;
    // Prevent MetaMask from auto-connecting
    const originalConnect = window.ethereum.request;
    window.ethereum.request = function({ method }) {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
        console.log('MetaMask connection blocked in food delivery app');
        return Promise.reject(new Error('Wallet connection disabled in this app'));
      }
      return originalConnect.apply(this, arguments);
    };
  }

  // Block other wallet injections
  Object.defineProperty(window, 'web3', {
    value: undefined,
    writable: false
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
