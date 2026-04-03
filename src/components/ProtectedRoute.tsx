import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/store/AuthContext';

export default function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: UserRole }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/clock" replace />;
  }

  return <>{children}</>;
}
