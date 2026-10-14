import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => parseJwt(localStorage.getItem('token')));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setUser(parseJwt(token));
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    setToken(response.token);
  };

  const register = async (nombre, email, password, rol) => {
    const response = await authService.register({ nombre, email, password, rol });
    setToken(response.token);
  };

  const logout = () => {
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, login, register, logout, isAuthenticated: Boolean(user) }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
