import { useAuth } from '@/context';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
  if (user && !user.displayName) {
    navigate('/getting-started');
  }
}, [user, navigate]);

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          Welcome to Waggle! 🐾
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Signed in as <span className="font-semibold text-[#573a1c] dark:text-amber-300">{user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardLink
          to="/dogs"
          icon="🐶"
          label="View/Search Dogs"
          description="Browse available dogs"
        />
        <DashboardLink
          to="/add-dog"
          icon="➕"
          label="Add a Dog"
          description="Register a new dog"
        />
        <DashboardLink
          to="/add-match"
          icon="💕"
          label="Add a Match"
          description="Create a breeding match"
        />
        <DashboardLink
          to="/matches"
          icon="📋"
          label="View Matches"
          description="See all your matches"
        />
      </div>

      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-900 dark:text-amber-200 text-center">
          💡 <span className="font-medium">Tip:</span> Use the search feature to find the perfect match for your dog!
        </p>
      </div>
    </div>
  );
};

interface DashboardLinkProps {
  to: string;
  icon: string;
  label: string;
  description: string;
}

const DashboardLink: React.FC<DashboardLinkProps> = ({ to, icon, label, description }) => (
  <Link
    to={to}
    className="group relative overflow-hidden bg-linear-to-br from-[#f3fde7] to-[#e8f5d8] dark:from-green-900/30 dark:to-green-800/20 hover:from-[#e1f7ce] hover:to-[#d4f0bd] dark:hover:from-green-800/40 dark:hover:to-green-700/30 transition-all duration-300 px-6 py-5 rounded-xl shadow-md hover:shadow-lg border border-green-200 dark:border-green-800/50"
  >
    <div className="flex items-start gap-4">
      <span className="text-4xl" role="img" aria-label={label}>
        {icon}
      </span>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-[#236035] dark:text-green-300 mb-1 group-hover:text-[#1a4828] dark:group-hover:text-green-200 transition-colors">
          {label}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <span className="text-[#236035] dark:text-green-300 transform group-hover:translate-x-1 transition-transform">
        →
      </span>
    </div>
  </Link>
);

export default Dashboard;

