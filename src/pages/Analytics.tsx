// src/pages/Analytics.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8c5628', '#d4a574', '#6d4320', '#f5deb3', '#a0522d', '#deb887'];

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { analytics, loading } = useAnalytics();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto my-10 p-6">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No analytics data available
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-10 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
          📊 Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your dog mating platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">
                {analytics.totalUsers}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{analytics.newUsersThisWeek} this week
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* Total Dogs */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Dogs</p>
              <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">
                {analytics.totalDogs}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{analytics.newDogsThisWeek} this week
              </p>
            </div>
            <div className="text-4xl">🐕</div>
          </div>
        </div>

        {/* Total Matches */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Matches</p>
              <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">
                {analytics.totalMatches}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +{analytics.newMatchesThisWeek} this week
              </p>
            </div>
            <div className="text-4xl">💕</div>
          </div>
        </div>

        {/* Active Conversations */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Chats</p>
              <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-500">
                {analytics.activeConversations}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last 7 days
              </p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            User Growth (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8c5628" 
                strokeWidth={2}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dogs by Gender */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Dogs by Gender
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.dogsByGender}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ gender, count }) => `${gender}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.dogsByGender.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Breeds Chart */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Top 10 Popular Breeds
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics.popularBreeds}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="breed" 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              stroke="#6B7280"
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#8c5628" name="Number of Dogs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate('/dogs')}
          className="p-4 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <span>🐕</span> View All Dogs
        </button>
        <button
          type="button"
          onClick={() => navigate('/matches')}
          className="p-4 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <span>💕</span> View Matches
        </button>
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="p-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <span>💬</span> View Messages
        </button>
      </div>
    </div>
  );
};

export default Analytics;