import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredUserType?: 'Admin' | 'Seller' | 'Customer';
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredUserType,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, token } = useAuth();
  const location = useLocation();

  // Check authentication
  if (!isAuthenticated || !token) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check user type if required
  if (requiredUserType && user) {
    // This would need to be stored in user data from the token
    // For now, we'll check if user has a role field that matches
    const userType = (user as any).userType || (user as any).role;
    if (userType && userType !== requiredUserType) {
      return <Navigate to="/" replace />;
    }
  }

  // Check role if required (for Admin users)
  if (requiredRole && user) {
    const userRole = (user as any).role;
    if (!userRole || userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

