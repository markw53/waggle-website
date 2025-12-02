import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import { SUBSCRIPTION_LIMITS } from '@/types/subscription';
import type { Subscription } from '@/types/subscription';
import { Timestamp } from 'firebase/firestore';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'subscriptions', user.uid),
      (doc) => {
        if (doc.exists()) {
          setSubscription(doc.data() as Subscription);
        } else {
          // Free tier by default
          setSubscription({
            userId: user.uid,
            tier: 'free',
            status: 'active',
            currentPeriodStart: Timestamp.now(),
            currentPeriodEnd: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
          });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const canUseFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_LIMITS[subscription.tier].features.includes(feature);
  };

  const canAddDog = (currentCount: number): boolean => {
    if (!subscription) return false;
    const limit = SUBSCRIPTION_LIMITS[subscription.tier].maxDogs;
    return limit === -1 || currentCount < limit;
  };

  // ⭐ ADD THIS FUNCTION
  const getRemainingDogs = (currentCount: number): number | typeof Infinity => {
    if (!subscription) return 0;
    const limit = SUBSCRIPTION_LIMITS[subscription.tier].maxDogs;
    
    if (limit === -1) {
      return Infinity; // Unlimited
    }
    
    return Math.max(0, limit - currentCount);
  };

  return {
    subscription,
    loading,
    canUseFeature,
    canAddDog,
    getRemainingDogs, // ⭐ ADD THIS TO RETURN OBJECT
    tier: subscription?.tier || 'free',
    isActive: subscription?.status === 'active'
  };
};