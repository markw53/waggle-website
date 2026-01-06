import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '@/config/routes';

interface SubscriptionData {
  subscription: {
    tier: string;
    status: string;
    currentPeriodEnd: {
      _seconds: number;
    };
    stripePriceId?: string;
  } | null;
  hasActiveSubscription: boolean;
}

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      toast.error('Invalid session');
      navigate(ROUTES.PRICING);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const functions = getFunctions();
        const getStatus = httpsCallable<void, SubscriptionData>(functions, 'getSubscriptionStatus');
        const result = await getStatus();
        setSubscription(result.data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    // Wait a moment for webhook to process
    setTimeout(fetchSubscription, 2000);
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c5628] dark:border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  const features = subscription?.subscription?.tier === 'premium' 
    ? [
        'Unlimited dog profiles',
        'Featured listings',
        'Advanced analytics',
        'Priority support',
        'Ad-free experience',
        'Early access to new features',
      ]
    : [
        'Up to 3 dog profiles',
        'Unlimited profile views',
        'Direct messaging',
        'Compatibility matching',
        'Priority support',
      ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 md:p-12">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <svg
            className="h-10 w-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-3">
            🎉 Welcome to Waggle {subscription?.subscription?.tier === 'premium' ? 'Premium' : 'Standard'}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your subscription has been activated successfully.
          </p>
        </div>

        {/* Subscription Details Card */}
        {subscription?.subscription && (
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-6 mb-8">
            <h2 className="font-semibold text-[#573a1c] dark:text-amber-200 text-lg mb-4">
              Subscription Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-semibold text-[#8c5628] dark:text-amber-400 capitalize">
                  {subscription.subscription.tier}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  {subscription.subscription.status}
                </span>
              </div>
              {subscription.subscription.currentPeriodEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Next billing date:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(subscription.subscription.currentPeriodEnd._seconds * 1000).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mb-8">
          <h3 className="font-semibold text-[#573a1c] dark:text-amber-200 text-lg mb-4">
            What's included in your plan:
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full bg-[#8c5628] dark:bg-amber-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-[#6d4320] dark:hover:bg-amber-700 transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(ROUTES.SUBSCRIPTION)}
            className="w-full bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
          >
            Manage Subscription
          </button>
          <button
            onClick={() => navigate(ROUTES.ADD_DOG)}
            className="w-full border-2 border-[#8c5628] dark:border-amber-600 text-[#8c5628] dark:text-amber-400 py-3 px-6 rounded-lg font-medium hover:bg-[#8c5628] hover:text-white dark:hover:bg-amber-600 dark:hover:text-white transition-colors"
          >
            Add Your First Dog
          </button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-8">
          Questions or need help? {' '}
          <a 
            href="mailto:support@waggle-app.com" 
            className="text-[#8c5628] dark:text-amber-400 hover:underline font-medium"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}