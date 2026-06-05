// src/services/authService.js

// Demo users for different roles
const DEMO_USERS = {
  citizen: {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "citizen",
    avatar: "RS",
    department_id: null
  },
  officer: {
    id: 3,
    name: "Amit Kumar",
    email: "amit@example.com",
    role: "officer",
    avatar: "AK",
    department_id: 1
  },
  admin: {
    id: 6,
    name: "Dr. Mehta",
    email: "mehta@example.com",
    role: "admin",
    avatar: "DM",
    department_id: 1
  },
  super_admin: {
    id: 7,
    name: "Super Admin",
    email: "admin@system.com",
    role: "super_admin",
    avatar: "SA",
    department_id: null
  }
};

// Demo password for all accounts
const DEMO_PASSWORD = "demo123";

import request from './api';

// Login function
export const login = async (email, password) => {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  
  const token = data.access_token;
  const user = data.user;
  
  // Store in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { user, token };
};

// Register function for Citizen self-registration
export const register = async (name, email, password) => {
  return request('/auth/register', {
    method: 'POST',
    body: {
      name,
      email,
      password,
      role: 'citizen'
    }
  });
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken() && !!getCurrentUser();
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
};