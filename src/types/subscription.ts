import { Timestamp } from 'firebase/firestore';

export type SubscriptionTier = 'free' | 'standard' | 'premium';

export type SubscriptionStatus = 
  | 'active' 
  | 'cancelled' 
  | 'expired'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Subscription {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  trialEnd?: Timestamp;
  canceledAt?: Timestamp;
}

export type InvoiceStatus = 
  | 'draft'
  | 'open'
  | 'paid'
  | 'uncollectible'
  | 'void';

export interface Invoice {
  id: string;
  userId: string;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  subscriptionId?: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  amountDue: number; // in pence
  amountPaid: number; // in pence
  currency: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  invoiceUrl?: string;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  paymentIntentId?: string;
  dueDate?: Timestamp;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  metadata?: Record<string, string>;
}

export interface Payment {
  id: string;
  userId: string;
  invoiceId?: string;
  subscriptionId?: string;
  sessionId?: string;
  paymentIntentId?: string;
  customerId?: string;
  amount: number; // in cents
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'completed';
  periodStart?: Timestamp;
  periodEnd?: Timestamp;
  error?: string;
  createdAt: Timestamp;
  metadata?: Record<string, string>;
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
    maxDogs: -1, // -1 means unlimited
    canMessage: true,
    canUseCompatibility: true,
    features: [
      'browse_breeds', 
      'view_profiles', 
      'messaging', 
      'compatibility', 
      'featured_listings', 
      'analytics'
    ]
  }
};

export const SUBSCRIPTION_PRICES = {
  standard: { 
    monthly: 9.99, 
    yearly: 99,
    stripePriceIdMonthly: 'price_standard_monthly', // Replace with actual Stripe price ID
    stripePriceIdYearly: 'price_standard_yearly'    // Replace with actual Stripe price ID
  },
  premium: { 
    monthly: 24.99, 
    yearly: 249,
    stripePriceIdMonthly: 'price_premium_monthly', // Replace with actual Stripe price ID
    stripePriceIdYearly: 'price_premium_yearly'    // Replace with actual Stripe price ID
  }
};

/**
 * Helper function to check if user has access to a feature
 */
export const hasFeatureAccess = (
  subscription: Subscription | null,
  feature: string
): boolean => {
  if (!subscription) {
    return SUBSCRIPTION_LIMITS.free.features.includes(feature);
  }
  
  return SUBSCRIPTION_LIMITS[subscription.tier].features.includes(feature);
};

/**
 * Helper function to check if subscription is active
 */
export const isSubscriptionActive = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;
  
  return (
    subscription.status === 'active' || 
    subscription.status === 'trialing'
  );
};

/**
 * Helper function to get remaining days in subscription
 */
export const getSubscriptionDaysRemaining = (subscription: Subscription): number => {
  if (!subscription.currentPeriodEnd) return 0;
  
  const now = new Date();
  const endDate = subscription.currentPeriodEnd.toDate();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Helper function to check if user can add more dogs
 */
export const canAddMoreDogs = (
  subscription: Subscription | null,
  currentDogCount: number
): boolean => {
  const tier = subscription?.tier || 'free';
  const maxDogs = SUBSCRIPTION_LIMITS[tier].maxDogs;
  
  // -1 means unlimited
  if (maxDogs === -1) return true;
  
  return currentDogCount < maxDogs;
};

/**
 * Format currency amount from cents to display
 */
export const formatCurrency = (
  amountInCents: number,
  currency: string = 'gbp'
): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
};

/**
 * Get tier display name
 */
export const getTierDisplayName = (tier: SubscriptionTier): string => {
  const names: Record<SubscriptionTier, string> = {
    free: 'Free',
    standard: 'Standard',
    premium: 'Premium'
  };
  return names[tier];
};

/**
 * Get tier color for UI
 */
export const getTierColor = (tier: SubscriptionTier): string => {
  const colors: Record<SubscriptionTier, string> = {
    free: 'gray',
    standard: 'blue',
    premium: 'purple'
  };
  return colors[tier];
};