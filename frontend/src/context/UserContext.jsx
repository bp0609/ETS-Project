import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup } from '../api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (name) => {
    try {
      console.log('🔐 Attempting login for:', name);
      const response = await apiLogin(name);
      console.log('✅ Login response:', response);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ User data saved:', userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Login failed. Check if backend is running.' 
      };
    }
  };

  const signup = async (name, email, phone) => {
    try {
      const response = await apiSignup(name, email, phone);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isTeacher = () => {
    return user?.role === 'teacher';
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    isTeacher,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;

