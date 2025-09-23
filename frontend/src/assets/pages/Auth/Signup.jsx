import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../Context/AuthContext';
import authService from '../../services/authService';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import Loader from '../../components/Loader';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // First signup the user
      await authService.signup({ name, email, password });
      setSuccess('Signup successful! Logging you in...');
      
      // Then automatically login the user
      setTimeout(async () => {
        try {
          await login({ email, password });
          // Always redirect to home page after signup, never to checkout
          navigate('/');
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          setError('Signup successful but auto-login failed. Please login manually.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }, 1000);
      
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Signup failed. Please check your details.');
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 via-red-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-md relative overflow-hidden hover:shadow-3xl dark:hover:shadow-gray-900/70 transition-shadow duration-300 animate-fadeIn"
        aria-label="Signup form"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white text-center">
          Create Account
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

        {/* Name Input */}
        <div className="relative mb-6">
          <input
            type="text"
            id="name"
            placeholder=" "
            className="peer w-full border-b-2 border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 outline-none py-2 placeholder-transparent transition-colors bg-transparent dark:text-white"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            aria-label="Name"
            autoComplete="name"
          />
          <label
            htmlFor="name"
            className="absolute left-0 -top-3.5 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-gray-500 dark:peer-focus:text-gray-300 peer-focus:text-sm"
          >
            Name
          </label>
        </div>

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
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder=" "
            className="peer w-full border-b-2 border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 outline-none py-2 pr-10 placeholder-transparent transition-colors bg-transparent dark:bg-transparent text-gray-900 dark:text-gray-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
            autoComplete="new-password"
          />
          <label
            htmlFor="password"
            className="absolute left-0 -top-3.5 text-gray-500 dark:text-gray-400 text-sm transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-gray-500 dark:peer-focus:text-gray-400 peer-focus:text-sm"
          >
            Password
          </label>
          <span
            className="absolute right-0 top-2.5 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={0}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            role="button"
          >
            {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-500 font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
