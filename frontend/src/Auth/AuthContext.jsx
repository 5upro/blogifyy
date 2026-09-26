import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, premiumAPI } from '../api';
import { FREE_BLOG_LIMIT } from '../premium/plans';

const AuthContext = createContext();

const FREE_ENTITLEMENTS = {
  blogLimit: FREE_BLOG_LIMIT,
  featuredImage: false,
  privatePosts: false,
  customTheme: false,
  premiumBadge: false
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  const isPremium = user?.plan === 'pro';
  const isProSubscriber = Boolean(
    user?.isProSubscriber ?? (user?.plan === 'pro' && user?.premiumStatus === 'active')
  );
  const entitlements = user?.entitlements || FREE_ENTITLEMENTS;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch {
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      const data = error.response?.data || {};
      return { 
        success: false, 
        message: data.message || 'Login failed',
        requiresOtp: Boolean(data.requiresOtp),
        otpSent: Boolean(data.otpSent),
        email: data.email || null
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { 
        success: true, 
        message: response.data.message,
        requiresVerification: true
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSubscription(null);
  };

  const updateCurrentUser = (userData) => {
    setUser(userData);
  };

  const refreshSubscription = async () => {
    try {
      const response = await premiumAPI.getSubscription();
      setSubscription(response.data);
      if (response.data?.subscription) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                plan: response.data.subscription.plan,
                premiumStatus: response.data.subscription.status,
                premiumExpiresAt: response.data.subscription.expiresAt,
                accent: response.data.subscription.accent,
                entitlements: response.data.subscription.entitlements
              }
            : prev
        );
      }
      return response.data;
    } catch {
      return null;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateCurrentUser,
    loading,
    isPremium,
    isProSubscriber,
    entitlements,
    subscription,
    refreshSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
