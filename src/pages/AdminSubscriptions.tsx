import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Users, CreditCard, TrendingUp, AlertCircle, Search, Download } from 'lucide-react';
import type { Subscription } from '@/types/subscription';

interface SubscriptionWithUser extends Subscription {
  userEmail?: string;
  userName?: string;
}

interface Stats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  standardCount: number;
  premiumCount: number;
  monthlyRevenue: number;
  cancelledCount: number;
}

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    standardCount: 0,
    premiumCount: 0,
    monthlyRevenue: 0,
    cancelledCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all');
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'standard' | 'premium'>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = new Map(
        usersSnapshot.docs.map(doc => [
          doc.id,
          { email: doc.data().email, name: doc.data().displayName }
        ])
      );

      // Fetch all subscriptions from all users
      const allSubscriptions: SubscriptionWithUser[] = [];
      
      for (const userDoc of usersSnapshot.docs) {
        const subDoc = await getDocs(
          collection(db, 'users', userDoc.id, 'subscription')
        );
        
        subDoc.forEach(doc => {
          if (doc.id === 'current' && doc.exists()) {
            const subData = doc.data() as Subscription;
            const userData = usersData.get(userDoc.id);
            allSubscriptions.push({
              ...subData,
              userId: userDoc.id,
              userEmail: userData?.email,
              userName: userData?.name,
            });
          }
        });
      }

      // Calculate stats
      const active = allSubscriptions.filter(
        s => s.status === 'active' || s.status === 'trialing'
      );
      const standard = allSubscriptions.filter(s => s.tier === 'standard');
      const premium = allSubscriptions.filter(s => s.tier === 'premium');
      const cancelled = allSubscriptions.filter(
        s => s.cancelAtPeriodEnd || s.status === 'cancelled'
      );

      // Calculate monthly revenue (rough estimate)
      const monthlyRevenue = 
        (standard.filter(s => s.status === 'active').length * 9.99) +
        (premium.filter(s => s.status === 'active').length * 24.99);

      setStats({
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: active.length,
        standardCount: standard.length,
        premiumCount: premium.length,
        monthlyRevenue,
        cancelledCount: cancelled.length,
      });

      setSubscriptions(allSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    // Filter by search term
    const matchesSearch = 
      sub.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userId.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && (sub.status === 'active' || sub.status === 'trialing')) ||
      (filterStatus === 'cancelled' && (sub.cancelAtPeriodEnd || sub.status === 'cancelled')) ||
      (filterStatus === 'expired' && sub.status === 'expired');

    // Filter by tier
    const matchesTier = filterTier === 'all' || sub.tier === filterTier;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const exportToCSV = () => {
    const headers = ['User ID', 'Email', 'Tier', 'Status', 'Period Start', 'Period End', 'Cancel at End'];
    const rows = filteredSubscriptions.map(sub => [
      sub.userId,
      sub.userEmail || 'N/A',
      sub.tier,
      sub.status,
      sub.currentPeriodStart?.toDate().toLocaleDateString() || 'N/A',
      sub.currentPeriodEnd?.toDate().toLocaleDateString() || 'N/A',
      sub.cancelAtPeriodEnd ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c5628] dark:border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage user subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalSubscriptions}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.activeSubscriptions}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-[#8c5628] dark:text-amber-400">
                £{stats.monthlyRevenue.toFixed(2)}
              </p>
            </div>
            <CreditCard className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cancellations</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.cancelledCount}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tier Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Free</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {subscriptions.filter(s => s.tier === 'free').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Standard</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {stats.standardCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Premium</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {stats.premiumCount}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalSubscriptions > 0
                  ? ((stats.activeSubscriptions / stats.totalSubscriptions) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Churn Rate</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.totalSubscriptions > 0
                  ? ((stats.cancelledCount / stats.totalSubscriptions) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Revenue/User</p>
              <p className="text-2xl font-bold text-[#8c5628] dark:text-amber-400">
                £{stats.activeSubscriptions > 0
                  ? (stats.monthlyRevenue / stats.activeSubscriptions).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Premium Rate</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalSubscriptions > 0
                  ? ((stats.premiumCount / stats.totalSubscriptions) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'cancelled' | 'expired')}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as 'all' | 'free' | 'standard' | 'premium')}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8c5628] dark:bg-amber-600 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stripe ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.userId} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {sub.userName || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {sub.userEmail || sub.userId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        sub.tier === 'free'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                          : sub.tier === 'standard'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                        {sub.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize inline-block w-fit ${
                          sub.status === 'active' || sub.status === 'trialing'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : sub.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {sub.status}
                        </span>
                        {sub.cancelAtPeriodEnd && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            Cancelling
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {sub.currentPeriodEnd?.toDate().toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {sub.stripeCustomerId ? (
                        <a
                          href={`https://dashboard.stripe.com/customers/${sub.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#8c5628] dark:text-amber-400 hover:underline"
                        >
                          {sub.stripeCustomerId.slice(0, 12)}...
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
      </div>
    </div>
  );
}