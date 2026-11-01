// client/src/context/AuthContext.jsx
// Global Authentication Context: manages user state, login, register, and logout
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Rehydrate user on initial page load if token is saved in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await getCurrentUser();
          if (res && res.user) {
            setUser(res.user);
          } else {
            // Token expired or user removed
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.warn('Session expired, logging out:', err.message);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Register handler
  const register = async (name, email, password, role) => {
    const res = await registerUser({ name, email, password, role });
    if (res && res.token && res.user) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume auth context easily in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
