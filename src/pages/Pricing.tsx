import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useAuth } from '@/context';
import { useSubscription } from '@/hooks/useSubscription';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { SUBSCRIPTION_PRICES } from '@/types/subscription';

interface PricingPlan {
  tier: 'free' | 'standard' | 'premium';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  priceIdMonthly: string;
  priceIdYearly: string;
  popular?: boolean;
}

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = async (priceId: string, tierName: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      navigate('/login');
      return;
    }

    if (tierName === 'Free') {
      toast.success('You are already on the free plan');
      return;
    }

    try {
      setLoading(true);

      const functions = getFunctions();
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const result = await createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription/cancelled`,
      });

      const data = result.data as { url: string };
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  const plans: PricingPlan[] = [
    {
      tier: 'free',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        '1 dog profile',
        'Browse breeds',
        'View limited profiles',
        'Basic community access',
      ],
      priceIdMonthly: '',
      priceIdYearly: '',
    },
    {
      tier: 'standard',
      name: 'Standard',
      monthlyPrice: SUBSCRIPTION_PRICES.standard.monthly,
      yearlyPrice: SUBSCRIPTION_PRICES.standard.yearly,
      features: [
        'Up to 3 dog profiles',
        'Unlimited profile views',
        'Direct messaging',
        'Compatibility matching',
        'Priority support',
      ],
      priceIdMonthly: import.meta.env.VITE_STRIPE_STANDARD_MONTHLY_PRICE_ID || '',
      priceIdYearly: import.meta.env.VITE_STRIPE_STANDARD_YEARLY_PRICE_ID || '',
      popular: true,
    },
    {
      tier: 'premium',
      name: 'Premium',
      monthlyPrice: SUBSCRIPTION_PRICES.premium.monthly,
      yearlyPrice: SUBSCRIPTION_PRICES.premium.yearly,
      features: [
        'Unlimited dog profiles',
        'All Standard features',
        'Featured listings',
        'Advanced analytics',
        'Ad-free experience',
        'Early access to new features',
      ],
      priceIdMonthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
      priceIdYearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
    },
  ];

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8c5628] dark:border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Find the perfect plan for you and your furry friends
          </p>

          {/* Period Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-zinc-800 rounded-lg p-1 shadow-md">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                period === 'monthly'
                  ? 'bg-[#8c5628] dark:bg-amber-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                period === 'yearly'
                  ? 'bg-[#8c5628] dark:bg-amber-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = subscription?.tier === plan.tier;
            const price = period === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const priceId = period === 'yearly' ? plan.priceIdYearly : plan.priceIdMonthly;

            return (
              <div
                key={plan.tier}
                className={`relative p-8 bg-white dark:bg-zinc-800 rounded-xl shadow-lg ${
                  plan.popular ? 'ring-2 ring-[#8c5628] dark:ring-amber-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8c5628] dark:bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-[#8c5628] dark:text-amber-400">
                      £{price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      /{period === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {period === 'yearly' && plan.tier !== 'free' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Save £{(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(2)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(priceId, plan.name)}
                  disabled={loading || isCurrent}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-[#8c5628] dark:bg-amber-600 text-white hover:bg-[#6d4320] dark:hover:bg-amber-700'
                      : 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-zinc-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : isCurrent ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[#573a1c] dark:text-amber-200 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <summary className="font-semibold text-[#573a1c] dark:text-amber-200 cursor-pointer">
                Can I cancel anytime?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </details>
            <details className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <summary className="font-semibold text-[#573a1c] dark:text-amber-200 cursor-pointer">
                Can I upgrade or downgrade my plan?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Yes, you can change your plan at any time through your account settings. Changes will be prorated.
              </p>
            </details>
            <details className="bg-white dark:bg-zinc-800 rounded-lg p-6">
              <summary className="font-semibold text-[#573a1c] dark:text-amber-200 cursor-pointer">
                What payment methods do you accept?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                We accept all major credit and debit cards through Stripe's secure payment processing.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}