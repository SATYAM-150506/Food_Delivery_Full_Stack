import React, { useState } from 'react';
import authService from '../services/authService';

const AuthTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    setTestResult('');
    try {
      const result = await authService.signup({
        name: 'Test User Frontend',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      });
      setTestResult('✅ Signup successful: ' + JSON.stringify(result));
    } catch (error) {
      setTestResult('❌ Signup failed: ' + JSON.stringify(error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setTestResult('');
    try {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });
      setTestResult('✅ Login successful: ' + JSON.stringify(result));
    } catch (error) {
      setTestResult('❌ Login failed: ' + JSON.stringify(error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded shadow">
      <h3 className="text-lg font-bold mb-4">Authentication Test</h3>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testSignup}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Signup
        </button>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Login
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {testResult && (
        <div className="p-3 bg-gray-100 border rounded">
          <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthTest;
