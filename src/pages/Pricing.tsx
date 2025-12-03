import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PRICES } from '@/types/subscription';

export default function Pricing() {
  const { tier } = useSubscription();

  const plans = [
    {
      name: 'Free',
      price: 0,
      features: ['1 dog profile', 'Browse breeds', 'View 10 profiles/day', 'Receive messages'],
      tier: 'free'
    },
    {
      name: 'Standard',
      price: SUBSCRIPTION_PRICES.standard.monthly,
      features: ['3 dog profiles', 'Unlimited browsing', 'Send messages', 'Compatibility matcher'],
      tier: 'standard',
      popular: true
    },
    {
      name: 'Premium',
      price: SUBSCRIPTION_PRICES.premium.monthly,
      features: ['Unlimited dogs', 'Featured listings', 'Analytics', 'Verified badge'],
      tier: 'premium'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Header with background */}
      <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-12 border border-zinc-200 dark:border-zinc-700">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
          Find the perfect plan for your breeding needs
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl p-6 backdrop-blur-sm transition-all ${
              plan.popular 
                ? 'bg-white/98 dark:bg-zinc-800/98 border-2 border-amber-500 shadow-2xl md:scale-105' 
                : 'bg-white/95 dark:bg-zinc-800/95 border-2 border-gray-200 dark:border-zinc-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                  <span>⭐</span> Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  £{plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                    /month
                  </span>
                )}
              </div>
            </div>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-green-500 dark:text-green-400 text-xl flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            
            {tier === plan.tier ? (
              <button
                disabled
                className="w-full py-3 bg-gray-300 dark:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold cursor-not-allowed"
              >
                Current Plan
              </button>
            ) : (
              <Link
                to={plan.tier === 'free' ? '/signup' : `/checkout/${plan.tier}`}
                className={`block w-full py-3 text-center rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-amber-700 text-white hover:bg-amber-600 shadow-lg'
                    : 'bg-amber-700 text-white hover:bg-amber-600'
                }`}
              >
                {plan.tier === 'free' ? 'Get Started' : 'Upgrade'}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section with background */}
      <div className="mt-16 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              Can I change plans anytime?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              We accept all major credit/debit cards via Stripe. All payments are secure and encrypted.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              Is there a money-back guarantee?
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Yes! We offer a 14-day money-back guarantee. If you're not satisfied, we'll refund your payment in full.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}