// src/routes/RedirectIfAuth.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { ROUTES } from '@/config/routes';
import Loading from '@/components/Loading';

const RedirectIfAuth: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading message="Checking authentication..." />;
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <>{children}</>;
};

export default RedirectIfAuth;