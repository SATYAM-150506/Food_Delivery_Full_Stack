const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('Testing authentication endpoints...\n');

  // Test signup
  try {
    console.log('1. Testing signup...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const signupResponse = await axios.post(`${API_BASE}/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data);
  } catch (error) {
    if (error.response?.data?.error === 'User already exists') {
      console.log('⚠️  User already exists, skipping signup test');
    } else {
      console.log('❌ Signup failed:', error.response?.data || error.message);
      return;
    }
  }

  // Test login
  try {
    console.log('\n2. Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE}/login`, loginData, {
      withCredentials: true
    });
    console.log('✅ Login successful:', loginResponse.data);
    
    // Extract cookie for further requests
    const cookies = loginResponse.headers['set-cookie'];
    console.log('🍪 Received cookies:', cookies);
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
  }
}

testAuth();
