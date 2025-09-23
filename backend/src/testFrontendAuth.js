const axios = require('axios');

async function testFrontendAuth() {
  console.log('Testing frontend auth flow...\n');

  // Test signup
  try {
    console.log('1. Testing signup...');
    const signupResponse = await axios.post('http://localhost:5000/api/auth/signup', {
      name: 'Frontend Test User',
      email: 'frontend@test.com',
      password: 'password123'
    });
    console.log('✅ Signup response:', signupResponse.data);
  } catch (error) {
    console.log('❌ Signup error:', error.response?.data || error.message);
  }

  // Test login
  try {
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'frontend@test.com',
      password: 'password123'
    }, {
      withCredentials: true
    });
    console.log('✅ Login response:', loginResponse.data);
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
  }
}

testFrontendAuth();
