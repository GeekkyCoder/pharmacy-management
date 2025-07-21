// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * @param {React.ReactNode} children - The component to render if access is granted
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route
 */
const ProtectedRoute = ({ children, allowedRoles, user, isDashaboardAndEmployee }) => {
  const location = useLocation();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user role is allowed for this route
  if (!allowedRoles.includes(user?.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Special handling for employees accessing dashboard (/) - redirect to inventory
  if (isDashaboardAndEmployee && location.pathname === "/") {
    return <Navigate to="/medicine-inventory" replace />;
  }

  return children;
};

export default ProtectedRoute;
