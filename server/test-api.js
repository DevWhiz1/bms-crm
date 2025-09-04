// Simple API test script
// Run this after starting the server to test the endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing BMS CRM API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test user signup
    console.log('\n2. Testing user signup...');
    const signupData = {
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const signupResponse = await axios.post(`${BASE_URL}/users/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    const token = signupResponse.data.data.token;

    // Test user login
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/users/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);

    // Test protected endpoint (get profile)
    console.log('\n4. Testing protected endpoint (get profile)...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.data.user.full_name);

    // Test token verification
    console.log('\n5. Testing token verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/users/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Token verification:', verifyResponse.data.message);

    console.log('\n🎉 All tests passed! API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
