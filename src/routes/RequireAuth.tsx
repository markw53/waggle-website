import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/auth';

const RequireAuth: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a spinner

  if (!user) {
    // Redirect to login, keep the next location state
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;