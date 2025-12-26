import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageLoader from './ui/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

/**
 * ProtectedRoute - Protects routes that require authentication
 * 
 * Usage:
 * - Wrap any route that requires login
 * - Use requiredRole="admin" to restrict to admin users only
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return <PageLoader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole === 'admin' && user?.role !== 'admin') {
    // Regular user trying to access admin routes - redirect to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
