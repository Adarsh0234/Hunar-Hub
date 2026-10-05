import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken } from '../services/api';
import authService from '../services/authService';
import userService from '../services/userService';
import { ACCOUNT_TYPES } from '../constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    const existingToken = getToken();
    if (!existingToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      const profile = await userService.getMe();
      setUser(profile);
      setAuthError(null);
      return profile;
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // If 401 or invalid token
      removeToken();
      setTokenState(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();

    const handleUnauthorized = () => {
      removeToken();
      setTokenState(null);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authService.login(email, password);
      if (res && res.token) {
        setToken(res.token);
        setTokenState(res.token);
        const profile = await userService.getMe();
        setUser(profile);
        return { success: true, user: profile };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await authService.register(userData);
      return res;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    setAuthError(null);
    try {
      const res = await authService.verifyOtp(email, otp);
      return res;
    } catch (err) {
      setAuthError(err.message || 'OTP verification failed');
      throw err;
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    setAuthError(null);
  };

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: !!user,
    isCustomer: user?.account_type === ACCOUNT_TYPES.CUSTOMER,
    isBusinessUser: user?.account_type === ACCOUNT_TYPES.BUSINESS_USER,
    login,
    register,
    verifyOtp,
    logout,
    refreshUser: loadCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
