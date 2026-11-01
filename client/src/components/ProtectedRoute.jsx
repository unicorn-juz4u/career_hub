// client/src/components/ProtectedRoute.jsx
// Guards routes: checks if the user is logged in and verifies their role
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role restriction is set and user's role is not allowed, redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleFallback =
      user.role === 'admin'
        ? '/dashboard/admin'
        : user.role === 'employer'
        ? '/dashboard/employer'
        : '/dashboard/user';

    return <Navigate to={roleFallback} replace />;
  }

  return children;
}
