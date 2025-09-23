import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Only clear redirect data if user is not on login or checkout pages
        const currentPath = window.location.pathname;
        if (currentPath !== '/checkout' && currentPath !== '/login') {
          // Clear redirect only if it's not a checkout redirect
          const storedRedirect = localStorage.getItem('redirectAfterLogin');
          if (storedRedirect !== '/checkout') {
            localStorage.removeItem('redirectAfterLogin');
          }
        }
        
        // Check if user should be remembered and if session hasn't expired
        const rememberUser = localStorage.getItem('rememberUser');
        const authExpiration = localStorage.getItem('authExpiration');
        
        if (rememberUser && authExpiration) {
          const expirationTime = parseInt(authExpiration);
          if (Date.now() > expirationTime) {
            // Session expired, clear data
            localStorage.removeItem('authExpiration');
            localStorage.removeItem('rememberUser');
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return;
          }
        }

        const userData = await authService.getCurrentUser();
        setUser(userData);
        console.log('✅ User authenticated:', userData);
      } catch (err) {
        console.log('ℹ️ No authenticated user');
        setUser(null);
        // Clear expired session data
        localStorage.removeItem('authExpiration');
        localStorage.removeItem('rememberUser');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      
      // Set remember me for 7 days if user wants to stay logged in
      const rememberMe = credentials.rememberMe || true; // Default to 7 days
      if (rememberMe) {
        const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        localStorage.setItem('authExpiration', expirationTime.toString());
        localStorage.setItem('rememberUser', 'true');
      }
      
      console.log('✅ Login successful:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('✅ Logout successful');
      
      // Clear all authentication data
      localStorage.removeItem('guestCart');
      localStorage.removeItem('authExpiration');
      localStorage.removeItem('rememberUser');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still clear user state even if backend call fails
      setUser(null);
      localStorage.removeItem('guestCart');
      localStorage.removeItem('authExpiration');
      localStorage.removeItem('rememberUser');
      localStorage.removeItem('token');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      await authService.updateProfile(profileData);
      // Fetch updated user data
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
      console.log('✅ Profile updated:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated,
      login, 
      logout, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
