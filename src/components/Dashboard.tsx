// src/components/Dashboard.tsx
import { useAuth } from '../hooks/auth';
import { useNavigate, Link } from 'react-router-dom';
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
        Signed in as <b>{user?.email}</b>
      </p>
      <div className="dashboard-actions">
        <Link to="/dogs" className="dashboard-link">
          <span role="img" aria-label="Dogs">🐶</span> View/Search Dogs
        </Link>
        <Link to="/add-dog" className="dashboard-link">
          <span role="img" aria-label="Add Dog">➕🐕</span> Add a Dog
        </Link>
        <Link to="/add-match" className="dashboard-link">
          <span role="img" aria-label="Add Match">🤝</span> Add a Match
        </Link>
        <Link to="/matches" className="dashboard-link">
          <span role="img" aria-label="View Matches">📋</span> View Matches
        </Link>
      </div>
      <button onClick={handleLogout} className="logout-btn">
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;