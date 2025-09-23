import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../assets/pages/Home/Home';
import Products from '../assets/pages/Products/Products';
import Cart from '../assets/pages/Cart/Cart';
import Checkout from '../assets/pages/Payment/Checkout';
import OrderHistory from '../assets/pages/Orders/OrderHistory';
import OrderConfirmation from '../assets/pages/Orders/OrderConfirmation';
import OrderTracking from '../assets/pages/Orders/OrderTracking';
import PaymentGateway from '../assets/pages/Payment/PaymentGateway';
import Profile from '../assets/pages/Profile/Profile';
import HelpDesk from '../assets/pages/HelpDesk/HelpDesk';
import Login from '../assets/pages/Auth/Login';
import Signup from '../assets/pages/Auth/Signup';
import Dashboard from '../assets/pages/Admin/Dashboard';
import ProtectedRoute from '../assets/components/ProtectedRoute';

// Error boundary component for better error handling
const ErrorBoundary = ({ children, fallback }) => {
  try {
    return children;
  } catch (error) {
    console.error('Route component error:', error);
    return fallback || <div className="p-4 text-center text-red-600">Something went wrong. Please try again.</div>;
  }
};

const AppRoutes = ({ isAuthenticated }) => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    } />
    <Route path="/products" element={
      <ErrorBoundary>
        <Products />
      </ErrorBoundary>
    } />
    <Route path="/login" element={
      <ErrorBoundary>
        <ProtectedRoute requireAuth={false}>
          <Login />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/signup" element={
      <ErrorBoundary>
        <ProtectedRoute requireAuth={false}>
          <Signup />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    {/* Semi-Protected Routes - cart allows guest access */}
    <Route path="/cart" element={
      <ErrorBoundary>
        <Cart />
      </ErrorBoundary>
    } />
    <Route path="/checkout" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    
    {/* Protected Routes - require authentication */}
    <Route path="/orders" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <OrderHistory />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/order-confirmation" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <OrderConfirmation />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/orders/track" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <OrderTracking />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/payment" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <PaymentGateway />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/profile" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/helpdesk" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <HelpDesk />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    
    {/* Admin Routes - require authentication */}
    <Route path="/admin/dashboard" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/admin/orders" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/admin/products" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
    <Route path="/admin/users" element={
      <ErrorBoundary>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </ErrorBoundary>
    } />
  </Routes>
);

export default AppRoutes;
