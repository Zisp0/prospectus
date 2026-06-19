import React, { createContext, useState, useEffect } from 'react';
import { loginUser, getCurrentUser } from '../services/api';
import { showError, showSuccess } from '../services/alerts';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (accessToken) {
    getCurrentUser()
        .then(res => setUser(res))
        .catch(() => {
          logout({ showAlert: false });
        });
    }
  }, [accessToken]);

  const login = async (email, password) => {
    try {
      const { access, refresh } = await loginUser(email, password);
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setAccessToken(access);
      const userRes = await getCurrentUser();
      setUser(userRes);
      showSuccess('Sesión iniciada', 'Bienvenido de nuevo.');
    } catch (error) {
      showError('No se pudo iniciar sesión', 'Revisa tus credenciales e inténtalo otra vez.');
      throw error;
    }
  };

  const logout = ({ showAlert = true } = {}) => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
    if (showAlert) {
      showSuccess('Sesión cerrada', 'Has salido correctamente.');
    }
  };

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
