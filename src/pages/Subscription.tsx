// src/pages/Subscription.tsx
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { SUBSCRIPTION_PRICES } from '@/types/subscription';

export default function Subscription() {
  const { subscription, tier, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">No Subscription Found</h1>
          <button
            onClick={() => navigate(ROUTES.PRICING)}
            className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-600"
          >
            View Pricing Plans
          </button>
        </div>
      </div>
    );
  }

  const isActive = subscription.status === 'active';
  const isCancelled = subscription.cancelAtPeriodEnd;
  const periodEnd = subscription.currentPeriodEnd?.toDate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Subscription Management
      </h1>

      {/* Current Plan */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold capitalize">{tier}</p>
            {tier !== 'free' && (
              <p className="text-gray-600 dark:text-gray-400">
                £{tier === 'standard' ? SUBSCRIPTION_PRICES.standard.monthly : SUBSCRIPTION_PRICES.premium.monthly}/month
              </p>
            )}
          </div>
          
          <div className={`px-4 py-2 rounded-full font-semibold ${
            isActive && !isCancelled
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {periodEnd && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isCancelled ? 'Ends on' : 'Renews on'}: {periodEnd.toLocaleDateString()}
          </p>
        )}

        {isCancelled && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              ⚠️ Your subscription is scheduled to cancel on {periodEnd?.toLocaleDateString()}. 
              You'll be downgraded to the Free plan.
            </p>
          </div>
        )}
      </div>

      {/* Plan Features */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Features</h2>
        <ul className="space-y-2">
          {tier === 'free' && (
            <>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 1 dog profile
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Browse breeds
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 10 profile views per day
              </li>
            </>
          )}
          {tier === 'standard' && (
            <>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Up to 3 dog profiles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited browsing
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Send messages
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Compatibility matcher
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Advanced filters
              </li>
            </>
          )}
          {tier === 'premium' && (
            <>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Unlimited dog profiles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Featured listings
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Advanced analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Verified badge
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Priority support
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        
        <div className="space-y-3">
          {tier !== 'premium' && (
            <button
              onClick={() => navigate(ROUTES.PRICING)}
              className="w-full px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-600 font-semibold"
            >
              Upgrade Plan
            </button>
          )}
          
          {tier !== 'free' && !isCancelled && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to cancel your subscription?')) {
                  // TODO: Implement cancel subscription
                  alert('Cancel subscription functionality coming soon');
                }
              }}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Cancel Subscription
            </button>
          )}
          
          {isCancelled && (
            <button
              onClick={() => {
                // TODO: Implement reactivate subscription
                alert('Reactivate subscription functionality coming soon');
              }}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Reactivate Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}