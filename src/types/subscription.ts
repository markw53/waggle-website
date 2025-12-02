import { Timestamp } from 'firebase/firestore';

export type SubscriptionTier = 'free' | 'standard' | 'premium';

export interface Subscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean; // ⭐ ADD THIS if missing
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const SUBSCRIPTION_LIMITS = {
  free: {
    maxDogs: 1,
    canMessage: false,
    canUseCompatibility: false,
    features: ['browse_breeds', 'view_profiles_limited']
  },
  standard: {
    maxDogs: 3,
    canMessage: true,
    canUseCompatibility: true,
    features: ['browse_breeds', 'view_profiles', 'messaging', 'compatibility']
  },
  premium: {
    maxDogs: -1,
    canMessage: true,
    canUseCompatibility: true,
    features: ['browse_breeds', 'view_profiles', 'messaging', 'compatibility', 'featured_listings', 'analytics']
  }
};

export const SUBSCRIPTION_PRICES = {
  standard: { monthly: 9.99, yearly: 99 },
  premium: { monthly: 24.99, yearly: 249 }
};