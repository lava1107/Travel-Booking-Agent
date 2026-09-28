import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Admin has system-wide access across all modules
  if (user.role === 'admin') {
    return children;
  }

  // Check specific allowed roles for customer / agent
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If an agent tries to access customer page or vice versa, redirect to their home dashboard
    if (user.role === 'agent') return <Navigate to="/agent" replace />;
    if (user.role === 'customer') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
