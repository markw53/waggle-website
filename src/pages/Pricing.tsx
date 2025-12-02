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
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border-2 rounded-lg p-6 ${
              plan.popular ? 'border-amber-500 shadow-xl scale-105' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="text-center mb-2">
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="text-4xl font-bold mb-4">
              £{plan.price}
              {plan.price > 0 && <span className="text-lg">/mo</span>}
            </div>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            {tier === plan.tier ? (
              <button
                disabled
                className="w-full py-2 bg-gray-300 text-gray-700 rounded-lg"
              >
                Current Plan
              </button>
            ) : (
              <Link
                to={plan.tier === 'free' ? '/signup' : `/checkout/${plan.tier}`}
                className="block w-full py-2 bg-amber-700 text-white text-center rounded-lg hover:bg-amber-600"
              >
                {plan.tier === 'free' ? 'Get Started' : 'Upgrade'}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}