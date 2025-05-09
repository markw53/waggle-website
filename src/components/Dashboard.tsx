// src/components/Dashboard.tsx
import { useAuth } from '../hooks/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out!');
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Logout failed.");
      } else {
        toast.error("Logout failed.");
      }
    }
  };

  return (
    <div className="dashboard-box">
      <h2>Welcome to Waggle!</h2>
      <p>
        You are signed in as <b>{user?.email}</b>
      </p>
      <button onClick={handleLogout} className="logout-btn">
        Log Out
      </button>
      {/* Add your dashboard features here */}
    </div>
  );
};

export default Dashboard;