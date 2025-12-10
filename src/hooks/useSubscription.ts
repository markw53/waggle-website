import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import { SUBSCRIPTION_LIMITS } from '@/types/subscription';
import type { Subscription } from '@/types/subscription';
import { Timestamp } from 'firebase/firestore';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Listen to subscription in users/{userId}/subscription/current
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid, 'subscription', 'current'),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setSubscription(docSnapshot.data() as Subscription);
        } else {
          // Check the old location for backwards compatibility
          const oldSubRef = doc(db, 'subscriptions', user.uid);
          const oldUnsubscribe = onSnapshot(oldSubRef, (oldDoc) => {
            if (oldDoc.exists()) {
              setSubscription(oldDoc.data() as Subscription);
            } else {
              // Free tier by default
              setSubscription({
                userId: user.uid,
                tier: 'free',
                status: 'active',
                currentPeriodStart: Timestamp.now(),
                currentPeriodEnd: Timestamp.fromDate(
                  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                ),
                cancelAtPeriodEnd: false,
              });
            }
          });
          
          setLoading(false);
          return () => oldUnsubscribe();
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Manually refetch subscription status from Firebase Functions
   * Useful after checkout or when you need to force refresh
   */
  const refetch = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const getSubscriptionStatus = httpsCallable(functions, 'getSubscriptionStatus');
      const result = await getSubscriptionStatus();
      const data = result.data as { subscription: Subscription | null };

      if (data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Error refetching subscription:', err);
      setError('Failed to refresh subscription');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user can use a specific feature
   */
  const canUseFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_LIMITS[subscription.tier].features.includes(feature);
  };

  /**
   * Check if user can add another dog
   */
  const canAddDog = (currentCount: number): boolean => {
    if (!subscription) return false;
    const limit = SUBSCRIPTION_LIMITS[subscription.tier].maxDogs;
    return limit === -1 || currentCount < limit;
  };

  /**
   * Get remaining dog slots
   */
  const getRemainingDogs = (currentCount: number): number | typeof Infinity => {
    if (!subscription) return 0;
    const limit = SUBSCRIPTION_LIMITS[subscription.tier].maxDogs;
    
    if (limit === -1) {
      return Infinity; // Unlimited
    }
    
    return Math.max(0, limit - currentCount);
  };

  /**
   * Check if subscription is currently active
   */
  const isActive = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'active' || subscription.status === 'trialing';
  };

  /**
   * Check if user can send messages
   */
  const canMessage = (): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_LIMITS[subscription.tier].canMessage;
  };

  /**
   * Check if user can use compatibility matching
   */
  const canUseCompatibility = (): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_LIMITS[subscription.tier].canUseCompatibility;
  };

  /**
   * Get days remaining in current period
   */
  const getDaysRemaining = (): number => {
    if (!subscription?.currentPeriodEnd) return 0;
    
    const now = new Date();
    const endDate = subscription.currentPeriodEnd.toDate();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  /**
   * Check if subscription will be cancelled at period end
   */
  const willCancel = (): boolean => {
    return subscription?.cancelAtPeriodEnd || false;
  };

  return {
    subscription,
    loading,
    error,
    refetch,
    // Feature checks
    canUseFeature,
    canAddDog,
    canMessage: canMessage(),
    canUseCompatibility: canUseCompatibility(),
    getRemainingDogs,
    // Subscription info
    tier: subscription?.tier || 'free',
    isActive: isActive(),
    daysRemaining: getDaysRemaining(),
    willCancel: willCancel(),
    // Stripe IDs (useful for customer portal)
    stripeCustomerId: subscription?.stripeCustomerId,
    stripeSubscriptionId: subscription?.stripeSubscriptionId,
  };
};