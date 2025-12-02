import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

interface PaywallProps {
  feature: string;
  featureName: string;
  requiredTier: 'standard' | 'premium';
  children: React.ReactNode;
}

export const Paywall: React.FC<PaywallProps> = ({ 
  feature, 
  featureName, 
  requiredTier, 
  children 
}) => {
  const { canUseFeature } = useSubscription();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="filter blur-sm pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-xl font-bold mb-2">Premium Feature</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {featureName} requires {requiredTier} membership
          </p>
          <Link
            to="/pricing"
            className="block w-full px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-600"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
};