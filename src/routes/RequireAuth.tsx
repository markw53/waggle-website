// src/routes/RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { ROUTES } from '@/config/routes';
import Loading from '@/components/Loading';

const RequireAuth: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading message="Verifying access..." />;
  if (!user) return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;

  return <>{children}</>;
};

export default RequireAuth;