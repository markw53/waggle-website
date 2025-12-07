import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe.js instance (client-side)
 * This is a singleton pattern to avoid loading Stripe multiple times
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.error('Stripe publishable key is not defined in environment variables');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

/**
 * Format amount for Stripe (convert dollars to cents)
 * @param amount - Amount in dollars
 * @returns Amount in cents
 */
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Format amount from Stripe (convert cents to dollars)
 * @param amount - Amount in cents
 * @returns Amount in dollars
 */
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

/**
 * Format currency for display
 * @param amount - Amount in cents
 * @param currency - Currency code (default: 'gbp')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'gbp'
): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(formatAmountFromStripe(amount));
};

/**
 * Stripe price tiers for subscription plans
 */
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: '', // No Stripe price ID for free tier
    features: [
      'Basic park finder',
      'Up to 5 favorite parks',
      'Community reviews',
      'Basic dog profile',
    ],
  },
  BASIC: {
    name: 'Basic',
    price: 4.99, // £4.99/month
    priceId: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID || '',
    features: [
      'Everything in Free',
      'Unlimited favorite parks',
      'Advanced filters',
      'Event notifications',
      'Priority support',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 9.99, // £9.99/month
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID || '',
    features: [
      'Everything in Basic',
      'Create & manage events',
      'Advanced analytics',
      'Ad-free experience',
      'Early access to features',
      'Premium badge',
    ],
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Stripe webhook event types we handle
 */
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

/**
 * Get subscription plan by price ID
 */
export const getSubscriptionPlanByPriceId = (
  priceId: string
): SubscriptionPlan | null => {
  const entries = Object.entries(SUBSCRIPTION_PLANS) as [
    SubscriptionPlan,
    typeof SUBSCRIPTION_PLANS[SubscriptionPlan]
  ][];

  for (const [key, plan] of entries) {
    if (plan.priceId === priceId) {
      return key;
    }
  }

  return null;
};

/**
 * Create a checkout session (to be called from your backend)
 */
export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

/**
 * Create a customer portal session (to be called from your backend)
 */
export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}

/**
 * Subscription status types
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

/**
 * User subscription data structure
 */
export interface UserSubscription {
  subscriptionId: string;
  customerId: string;
  priceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = (
  subscription: UserSubscription | null
): boolean => {
  if (!subscription) return false;
  return (
    subscription.status === 'active' || subscription.status === 'trialing'
  );
};

/**
 * Check if user has specific plan or higher
 */
export const hasMinimumPlan = (
  userPlan: SubscriptionPlan,
  requiredPlan: SubscriptionPlan
): boolean => {
  const planHierarchy: SubscriptionPlan[] = ['FREE', 'BASIC', 'PREMIUM'];
  const userPlanIndex = planHierarchy.indexOf(userPlan);
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

  return userPlanIndex >= requiredPlanIndex;
};

export default getStripe;