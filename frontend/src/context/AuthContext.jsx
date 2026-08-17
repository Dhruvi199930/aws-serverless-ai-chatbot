import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('chatbot_jwt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('chatbot_user');
      const storedToken = localStorage.getItem('chatbot_jwt_token');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setLoading(false);
          return;
        } catch (e) {
          // invalid stored user
        }
      }

      // Auto initialize guest session so chat works seamlessly out of the box
      try {
        const guestEmail = 'guest@aws-serverless.io';
        const guestPassword = 'GuestPassword123!';
        try {
          const data = await authApi.login(guestEmail, guestPassword);
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem('chatbot_jwt_token', data.token);
          localStorage.setItem('chatbot_user', JSON.stringify(data.user));
        } catch (e) {
          const regData = await authApi.register('Guest Developer', guestEmail, guestPassword);
          setToken(regData.token);
          setUser(regData.user);
          localStorage.setItem('chatbot_jwt_token', regData.token);
          localStorage.setItem('chatbot_user', JSON.stringify(regData.user));
        }
      } catch (err) {
        console.warn('Guest auth initialization failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('chatbot_jwt_token', data.token);
    localStorage.setItem('chatbot_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('chatbot_jwt_token', data.token);
    localStorage.setItem('chatbot_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('chatbot_jwt_token');
    localStorage.removeItem('chatbot_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
