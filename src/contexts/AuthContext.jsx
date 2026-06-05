/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getCurrentUser,
  isAuthenticated,
  login as apiLogin,
  logout as apiLogout,
} from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(() => isAuthenticated());

  const login = async (email, password) => {
    setIsLoading(true);

    try {
      const { user: loggedInUser, token } = await apiLogin(email, password);
      setUser(loggedInUser);
      setIsAuthenticatedState(true);
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      return { success: true, user: loggedInUser, token };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setIsAuthenticatedState(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: isAuthenticatedState,
    login,
    logout,
    updateUser,
    hasRole: (role) => {
      if (!user) return false;
      if (Array.isArray(role)) return role.includes(user.role);
      return user.role === role;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
