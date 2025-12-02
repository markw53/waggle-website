// src/components/SubscriptionBanner.tsx
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

export default function SubscriptionBanner() {
  const { tier } = useSubscription();
  const navigate = useNavigate();

  if (tier !== 'free') return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-semibold">Unlock Premium Features</p>
            <p className="text-sm opacity-90">Get unlimited dogs, advanced filters & more</p>
          </div>
        </div>
        <button
          onClick={() => navigate(ROUTES.PRICING)}
          className="px-6 py-2 bg-white text-amber-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}