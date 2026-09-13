import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getStoredUser());
  const [token, setToken] = useState(authService.getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getStoredToken();
      if (storedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser((prev) => ({ ...prev, ...profile }));
        } catch {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
