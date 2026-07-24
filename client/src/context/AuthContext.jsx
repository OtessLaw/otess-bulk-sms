import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('otess_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('otess_token') || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUserSession = async () => {
      if (token) {
        try {
          const response = await API.get('/auth/profile');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('otess_user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Session verification error:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('otess_token', userToken);
    localStorage.setItem('otess_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('otess_token');
    localStorage.removeItem('otess_user');
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('otess_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
