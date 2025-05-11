// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';

/**
 * @param {React.ReactNode} children - The component to render if access is granted
 * @param {Array<string>} allowedRoles - Array of roles allowed to access the route
 */
const ProtectedRoute = ({ children, allowedRoles, user }) => {

  if(!user) {
     return <Navigate to={"/auth/login"} replace />
  }

  if (!allowedRoles.includes(user?.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
