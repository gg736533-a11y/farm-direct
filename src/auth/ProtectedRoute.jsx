import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Sprout } from 'lucide-react';

/**
 * Route protection wrapper enforcing authentication and role-based permissions.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'consumer' | 'farmer'} [props.allowedRole] - Role required to access this route
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a minimal, branded loading spinner while auth state is restored from localStorage
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#FAF8F5]">
        <div className="w-14 h-14 rounded-2xl bg-forest-900 flex items-center justify-center text-cream-50 shadow-soft animate-pulse">
          <Sprout className="w-7 h-7 text-fresh-400" />
        </div>
        <p className="text-sm font-bold text-forest-950 tracking-wide">
          Loading FarmDirect...
        </p>
      </div>
    );
  }

  // If not authenticated, redirect to /login with attempted location in state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role does not match the required role for this route:
  if (allowedRole && user.role !== allowedRole) {
    // If consumer tries to access farmer dashboard or farmer routes:
    if (user.role === 'consumer' && allowedRole === 'farmer') {
      return <Navigate to="/unauthorized" state={{ attemptedRole: 'farmer' }} replace />;
    }

    // If farmer tries to access consumer account routes:
    if (user.role === 'farmer' && allowedRole === 'consumer') {
      return <Navigate to="/unauthorized" state={{ attemptedRole: 'consumer' }} replace />;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
