import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto' }} />
      </div>
    );
  }

  // If attempting to access an admin route while unauthenticated, redirect specifically to /admin/login
  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} state={{ from: location }} replace />;
  }

  // If authenticated but not an admin, regular users must not access admin pages
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};
