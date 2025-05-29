import { useAuth } from '../hooks/auth';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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
        toast.error(err.message || 'Logout failed.');
      } else {
        toast.error('Logout failed.');
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white dark:bg-neutral-900 rounded-xl shadow-xl flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-[#573a1c] dark:text-amber-300">Welcome to Waggle!</h2>
      <p className="my-5 text-lg text-[#563708] dark:text-neutral-300">
        Signed in as <b>{user?.email}</b>
      </p>

      <div className="w-full flex flex-col gap-4 mb-8">
        <Link
          to="/dogs"
          className="text-[#236035] dark:text-green-300 bg-[#f3fde7] dark:bg-green-900/40 hover:bg-[#e1f7ce] dark:hover:bg-green-800/50 transition-colors px-4 py-3 rounded-lg font-medium text-lg shadow-sm flex items-center justify-center gap-2"
        >
          <span role="img" aria-label="Dogs">🐶</span> View/Search Dogs
        </Link>
        <Link
          to="/add-dog"
          className="text-[#236035] dark:text-green-300 bg-[#f3fde7] dark:bg-green-900/40 hover:bg-[#e1f7ce] dark:hover:bg-green-800/50 transition-colors px-4 py-3 rounded-lg font-medium text-lg shadow-sm flex items-center justify-center gap-2"
        >
          <span role="img" aria-label="Add Dog">➕🐕</span> Add a Dog
        </Link>
        <Link
          to="/add-match"
          className="text-[#236035] dark:text-green-300 bg-[#f3fde7] dark:bg-green-900/40 hover:bg-[#e1f7ce] dark:hover:bg-green-800/50 transition-colors px-4 py-3 rounded-lg font-medium text-lg shadow-sm flex items-center justify-center gap-2"
        >
          <span role="img" aria-label="Add Match">🤝</span> Add a Match
        </Link>
        <Link
          to="/matches"
          className="text-[#236035] dark:text-green-300 bg-[#f3fde7] dark:bg-green-900/40 hover:bg-[#e1f7ce] dark:hover:bg-green-800/50 transition-colors px-4 py-3 rounded-lg font-medium text-lg shadow-sm flex items-center justify-center gap-2"
        >
          <span role="img" aria-label="View Matches">📋</span> View Matches
        </Link>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 px-6 py-2 bg-[#a83824] hover:bg-[#8c2c17] text-white rounded-md font-semibold transition-opacity hover:opacity-90"
      >
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;
