// src/pages/Subscription.tsx
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { ROUTES } from '@/config/routes';
import { SUBSCRIPTION_PRICES } from '@/types/subscription';
import toast from 'react-hot-toast';
import { CreditCard, FileText, Settings, AlertCircle } from 'lucide-react';

export default function Subscription() {
  const { subscription, tier, loading, isActive, daysRemaining, willCancel, stripeCustomerId } = useSubscription();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);

   const handleManageBilling = async () => {
    if (!stripeCustomerId) {
      toast.error('No billing information found');
      return;
    }

    try {
      setActionLoading(true);
      const functions = getFunctions();
      const createPortalSession = httpsCallable(functions, 'createPortalSession');
      const result = await createPortalSession({
        returnUrl: window.location.href,
      });

      const data = result.data as { url: string };
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewInvoices = () => {
    navigate('/subscription/invoices');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c5628] dark:border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Subscription Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start with a free account or choose a premium plan to unlock more features.
          </p>
          <button
            onClick={() => navigate(ROUTES.PRICING)}
            className="px-6 py-3 bg-[#8c5628] dark:bg-amber-600 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-700 font-semibold transition-colors"
          >
            View Pricing Plans
          </button>
        </div>
      </div>
    );
  }

  const periodEnd = subscription.currentPeriodEnd?.toDate();
  const priceMonthly = tier === 'standard' 
    ? SUBSCRIPTION_PRICES.standard.monthly 
    : tier === 'premium' 
    ? SUBSCRIPTION_PRICES.premium.monthly 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Subscription Management
      </h1>

      {/* Current Plan */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Current Plan</h2>
          {tier !== 'free' && (
            <button
              onClick={handleManageBilling}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
            >
              <Settings className="w-4 h-4" />
              Manage Billing
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold capitalize text-[#573a1c] dark:text-amber-200">
              {tier}
            </p>
            {tier !== 'free' && (
              <p className="text-gray-600 dark:text-gray-400">
                £{priceMonthly}/month
              </p>
            )}
          </div>
          
          <div className={`px-4 py-2 rounded-full font-semibold ${
            isActive && !willCancel
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : willCancel
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {isActive ? (willCancel ? 'Cancelling' : 'Active') : 'Inactive'}
          </div>
        </div>

        {periodEnd && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {willCancel ? 'Access ends' : 'Renews'} on: {periodEnd.toLocaleDateString()}
            </p>
            {isActive && daysRemaining > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {daysRemaining} days remaining
              </p>
            )}
          </div>
        )}

        {willCancel && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                Your subscription is scheduled to cancel on {periodEnd?.toLocaleDateString()}. 
                You'll be downgraded to the Free plan. You can reactivate anytime before then.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Plan Features */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Features</h2>
        <ul className="space-y-3">
          {tier === 'free' && (
            <>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> 1 dog profile
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Browse breeds
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> View limited profiles
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Basic community access
              </li>
            </>
          )}
          {tier === 'standard' && (
            <>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Up to 3 dog profiles
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Unlimited profile views
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Direct messaging
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Compatibility matching
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Advanced filters
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Priority support
              </li>
            </>
          )}
          {tier === 'premium' && (
            <>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Unlimited dog profiles
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> All Standard features
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Featured listings
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Advanced analytics
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Ad-free experience
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Verified badge
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Priority support
              </li>
              <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-green-500 text-xl">✓</span> Early access to features
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
              className="w-full px-6 py-3 bg-[#8c5628] dark:bg-amber-600 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-700 font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {tier === 'free' ? 'Choose a Plan' : 'Upgrade Plan'}
            </button>
          )}
          
          {tier !== 'free' && (
            <>
              <button
                onClick={handleManageBilling}
                disabled={actionLoading}
                className="w-full px-6 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Settings className="w-5 h-5" />
                {actionLoading ? 'Loading...' : 'Manage Billing & Payments'}
              </button>

              <button
                onClick={handleViewInvoices}
                className="w-full px-6 py-3 bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-600 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Invoices
              </button>
            </>
          )}
        </div>

        {tier !== 'free' && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              To cancel or modify your subscription, use the "Manage Billing" button above.
              All changes are handled securely through Stripe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}