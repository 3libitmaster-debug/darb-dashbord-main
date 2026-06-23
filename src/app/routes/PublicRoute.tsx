import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { UserRole } from '../../types/auth';

export function PublicRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === UserRole.Admin) {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === UserRole.Company) {
      return <Navigate to="/company" replace />;
    }
  }

  return <Outlet />;
}
