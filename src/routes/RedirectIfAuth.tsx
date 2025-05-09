import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth';

const RedirectIfAuth: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or spinner

  if (user) {
    // Change to '/dashboard' or main authenticated page
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RedirectIfAuth;