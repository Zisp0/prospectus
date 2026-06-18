import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (accessToken) {
      api.get('auth/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          logout();
        });
    }
  }, [accessToken]);

  const login = async (email, password) => {
    try {
      const response = await api.post('auth/login/', { email, password });
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setAccessToken(access);
      toast.success('Logged in');
      const userRes = await api.get('auth/me/');
      setUser(userRes.data);
    } catch (error) {
      toast.error('Login failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
