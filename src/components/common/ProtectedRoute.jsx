// src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Role-based dashboard redirect mapping
const ROLE_REDIRECTS = {
  citizen: '/citizen/dashboard',
  officer: '/officer/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/superadmin/dashboard',
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const redirectPath = ROLE_REDIRECTS[user?.role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and authorized — render children or nested routes
  return children ?? <Outlet />;
};

export default ProtectedRoute;