import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import Loader from '../../components/Loader';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // Get redirect path from location state, query params, or localStorage
  const urlParams = new URLSearchParams(location.search);
  const queryRedirect = urlParams.get('redirect');
  const storedRedirect = localStorage.getItem('redirectAfterLogin');
  
  // Only redirect to checkout if explicitly requested from cart page
  // For new users or normal login, always redirect to home
  const redirectPath = (queryRedirect === 'checkout' && storedRedirect === '/checkout') 
                       ? '/checkout' 
                       : location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await login({ email, password });
      setSuccess('Login successful! Redirecting...');
      
      // Clear the stored redirect
      localStorage.removeItem('redirectAfterLogin');
      
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-red-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-md relative overflow-hidden animate-fadeIn"
        aria-label="Login form"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white text-center">
          Login
        </h2>

        {loading && (
          <div className="flex justify-center mb-4">
            <Loader />
          </div>
        )}
        {error && (
          <p className="text-red-500 mb-4 text-center animate-pulse font-medium">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 mb-4 text-center animate-fadeIn font-medium">
            {success}
          </p>
        )}

        {/* Email Input */}
        <div className="relative mb-6">
          <input
            type="email"
            id="email"
            placeholder=" "
            className="peer w-full border-b-2 border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 outline-none py-2 placeholder-transparent transition-colors bg-transparent dark:text-white"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Email"
            autoComplete="email"
          />
          <label
            htmlFor="email"
            className="absolute left-0 -top-3.5 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-gray-500 dark:peer-focus:text-gray-300 peer-focus:text-sm"
          >
            Email
          </label>
        </div>

        {/* Password Input */}
        <div className="relative mb-6">
          <input
            type="password"
            id="password"
            placeholder=" "
            className="peer w-full border-b-2 border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 outline-none py-2 placeholder-transparent transition-colors bg-transparent dark:text-white"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
            autoComplete="current-password"
          />
          <label
            htmlFor="password"
            className="absolute left-0 -top-3.5 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-gray-500 dark:peer-focus:text-gray-300 peer-focus:text-sm"
          >
            Password
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 dark:from-yellow-500 dark:via-red-500 dark:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-yellow-500 dark:text-yellow-400 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
