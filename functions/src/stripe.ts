import * as functions from 'firebase-functions';
import { defineString } from 'firebase-functions/params';
import Stripe from 'stripe';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CallableRequest } from 'firebase-functions/v2/https';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

// Define environment parameters
const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineString('STRIPE_WEBHOOK_SECRET');
const stripeStandardMonthlyPriceId = defineString('STRIPE_STANDARD_MONTHLY_PRICE_ID');
const stripeStandardYearlyPriceId = defineString('STRIPE_STANDARD_YEARLY_PRICE_ID');
const stripePremiumMonthlyPriceId = defineString('STRIPE_PREMIUM_MONTHLY_PRICE_ID');
const stripePremiumYearlyPriceId = defineString('STRIPE_PREMIUM_YEARLY_PRICE_ID');

// Type for subscription status
type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'past_due' 
  | 'trialing' 
  | 'unpaid'
  | 'cancelled';

// Extended Stripe types to include missing properties
interface ExtendedStripeInvoice extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription;
  payment_intent?: string | Stripe.PaymentIntent;
}

// Helper type for subscription with guaranteed period properties
type SubscriptionWithPeriods = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
  trial_end?: number | null;
};

// Initialize Stripe lazily
const getStripe = () => {
  return new Stripe(stripeSecretKey.value());
};

/**
 * Map Stripe price ID to subscription tier
 */
const getPriceIdToTierMap = (): Record<string, 'standard' | 'premium'> => {
  return {
    [stripeStandardMonthlyPriceId.value()]: 'standard',
    [stripeStandardYearlyPriceId.value()]: 'standard',
    [stripePremiumMonthlyPriceId.value()]: 'premium',
    [stripePremiumYearlyPriceId.value()]: 'premium',
  };
};

/**
 * Get customer ID from Stripe customer object
 */
const getCustomerId = (customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string => {
  if (typeof customer === 'string') {
    return customer;
  }
  if (customer && 'id' in customer) {
    return customer.id;
  }
  return '';
};

/**
 * Get subscription ID from invoice
 */
const getSubscriptionIdFromInvoice = (invoice: Stripe.Invoice): string | null => {
  const extendedInvoice = invoice as ExtendedStripeInvoice;
  if (typeof extendedInvoice.subscription === 'string') {
    return extendedInvoice.subscription;
  }
  return null;
};

/**
 * Safely get period start from subscription
 */
const getPeriodStart = (subscription: Stripe.Subscription): number => {
  return (subscription as SubscriptionWithPeriods).current_period_start;
};

/**
 * Safely get period end from subscription
 */
const getPeriodEnd = (subscription: Stripe.Subscription): number => {
  return (subscription as SubscriptionWithPeriods).current_period_end;
};

/**
 * Safely get trial end from subscription
 */
const getTrialEnd = (subscription: Stripe.Subscription): number | null => {
  return (subscription as SubscriptionWithPeriods).trial_end || null;
};

/**
 * Save invoice to Firestore
 */
async function saveInvoiceToFirestore(userId: string, invoice: Stripe.Invoice) {
  const extendedInvoice = invoice as ExtendedStripeInvoice;
  
  const invoiceData = {
    userId,
    stripeInvoiceId: invoice.id,
    stripeCustomerId: getCustomerId(invoice.customer),
    subscriptionId: typeof extendedInvoice.subscription === 'string' ? extendedInvoice.subscription : null,
    status: invoice.status || 'draft',
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    periodStart: Timestamp.fromDate(new Date(invoice.period_start * 1000)),
    periodEnd: Timestamp.fromDate(new Date(invoice.period_end * 1000)),
    invoiceUrl: invoice.invoice_pdf || null,
    invoicePdf: invoice.invoice_pdf || null,
    hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    paymentIntentId: typeof extendedInvoice.payment_intent === 'string' ? extendedInvoice.payment_intent : null,
    dueDate: invoice.due_date 
      ? Timestamp.fromDate(new Date(invoice.due_date * 1000))
      : null,
    paidAt: invoice.status_transitions?.paid_at
      ? Timestamp.fromDate(new Date(invoice.status_transitions.paid_at * 1000))
      : null,
    createdAt: Timestamp.fromDate(new Date(invoice.created * 1000)),
    updatedAt: Timestamp.now(),
    metadata: invoice.metadata || {},
  };

  await db.collection('invoices').doc(invoice.id).set(invoiceData, { merge: true });

  console.log(`Saved invoice ${invoice.id} for user ${userId}`);
}

/**
 * Update user subscription in Firestore
 */
async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  const priceIdToTierMap = getPriceIdToTierMap();
  
  const tier = priceIdToTierMap[priceId] || 'free';

  const subscriptionData = {
    userId,
    tier,
    status: subscription.status as SubscriptionStatus,
    currentPeriodStart: Timestamp.fromDate(new Date(getPeriodStart(subscription) * 1000)),
    currentPeriodEnd: Timestamp.fromDate(new Date(getPeriodEnd(subscription) * 1000)),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    trialEnd: getTrialEnd(subscription)
      ? Timestamp.fromDate(new Date(getTrialEnd(subscription)! * 1000))
      : null,
    updatedAt: Timestamp.now(),
  };

  await db.collection('users').doc(userId).collection('subscription').doc('current').set(
    subscriptionData,
    { merge: true }
  );

  console.log(`Updated subscription for user ${userId}:`, subscriptionData);
}

/**
 * Handle invoice created
 */
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  console.log('Invoice created:', invoice.id);

  let userId = invoice.metadata?.userId;

  if (!userId) {
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);
    if (subscriptionId) {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      userId = subscription.metadata?.userId;
    }
  }

  if (!userId) {
    console.error('No userId found in invoice');
    return;
  }

  await saveInvoiceToFirestore(userId, invoice);
}

/**
 * Handle invoice finalized
 */
async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  console.log('Invoice finalized:', invoice.id);

  let userId = invoice.metadata?.userId;

  if (!userId) {
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);
    if (subscriptionId) {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      userId = subscription.metadata?.userId;
    }
  }

  if (!userId) {
    console.error('No userId found in invoice');
    return;
  }

  await saveInvoiceToFirestore(userId, invoice);
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);

  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  
  if (!subscriptionId) {
    console.log('No subscription associated with this invoice');
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await saveInvoiceToFirestore(userId, invoice);

  await db.collection('payments').add({
    userId,
    invoiceId: invoice.id,
    subscriptionId: subscription.id,
    customerId: getCustomerId(invoice.customer),
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    periodStart: Timestamp.fromDate(new Date(invoice.period_start * 1000)),
    periodEnd: Timestamp.fromDate(new Date(invoice.period_end * 1000)),
    createdAt: Timestamp.now(),
    paidAt: invoice.status_transitions?.paid_at 
      ? Timestamp.fromDate(new Date(invoice.status_transitions.paid_at * 1000))
      : Timestamp.now(),
  });

  await updateUserSubscription(userId, subscription);
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  const subscriptionId = getSubscriptionIdFromInvoice(invoice);
  
  if (!subscriptionId) {
    console.log('No subscription associated with this invoice');
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await saveInvoiceToFirestore(userId, invoice);

  await db.collection('payments').add({
    userId,
    invoiceId: invoice.id,
    subscriptionId: subscription.id,
    customerId: getCustomerId(invoice.customer),
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    error: invoice.last_finalization_error?.message || 'Payment failed',
    createdAt: Timestamp.now(),
  });

  await updateUserSubscription(userId, subscription);
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  if (session.mode === 'subscription' && session.subscription) {
    const stripe = getStripe();
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await updateUserSubscription(userId, subscription);
  }

  await db.collection('payments').add({
    userId,
    sessionId: session.id,
    customerId: session.customer,
    amount: session.amount_total,
    currency: session.currency,
    status: 'completed',
    createdAt: Timestamp.now(),
  });
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, subscription);
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await updateUserSubscription(userId, subscription);
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await db.collection('users').doc(userId).collection('subscription').doc('current').set({
    userId,
    tier: 'free',
    status: 'cancelled' as SubscriptionStatus,
    cancelAtPeriodEnd: false,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: Timestamp.fromDate(new Date(getPeriodStart(subscription) * 1000)),
    currentPeriodEnd: Timestamp.fromDate(new Date(getPeriodEnd(subscription) * 1000)),
    canceledAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

/**
 * Handle payment intent succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);

  const userId = paymentIntent.metadata?.userId;
  if (!userId) {
    return;
  }

  await db.collection('payments').add({
    userId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    createdAt: Timestamp.now(),
  });
}

/**
 * Handle payment intent failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id);

  const userId = paymentIntent.metadata?.userId;
  if (!userId) {
    return;
  }

  await db.collection('payments').add({
    userId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'failed',
    error: paymentIntent.last_payment_error?.message,
    createdAt: Timestamp.now(),
  });
}

/**
 * Stripe webhook endpoint
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('No Stripe signature found');
    res.status(400).send('No Stripe signature found');
    return;
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      stripeWebhookSecret.value()
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }

  console.log('Received Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler failed');
  }
});

interface CheckoutSessionData {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a checkout session
 */
export const createCheckoutSession = functions.https.onCall(async (request: CallableRequest<CheckoutSessionData>) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { priceId, successUrl, cancelUrl } = request.data;
  const userId = request.auth.uid;

  if (!priceId || !successUrl || !cancelUrl) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters'
    );
  }

  try {
    const stripe = getStripe();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    let customerId = userData?.stripeCustomerId as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email as string,
        metadata: { userId },
      });
      customerId = customer.id;

      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create checkout session'
    );
  }
});

interface PortalSessionData {
  returnUrl: string;
}

/**
 * Create a customer portal session
 */
export const createPortalSession = functions.https.onCall(async (request: CallableRequest<PortalSessionData>) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { returnUrl } = request.data;
  const userId = request.auth.uid;

  if (!returnUrl) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing returnUrl'
    );
  }

  try {
    const stripe = getStripe();
    const userDoc = await db.collection('users').doc(userId).get();
    const customerId = userDoc.data()?.stripeCustomerId as string | undefined;

    if (!customerId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No customer ID found'
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create portal session'
    );
  }
});

/**
 * Get subscription status
 */
export const getSubscriptionStatus = functions.https.onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = request.auth.uid;

  try {
    const subscriptionDoc = await db
      .collection('users')
      .doc(userId)
      .collection('subscription')
      .doc('current')
      .get();

    const subscription = subscriptionDoc.data() || null;

    return {
      subscription,
      hasActiveSubscription: 
        subscription?.status === 'active' || 
        subscription?.status === 'trialing',
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get subscription status'
    );
  }
});

interface GetInvoicesData {
  limit?: number;
}

/**
 * Get user invoices
 */
export const getUserInvoices = functions.https.onCall(async (request: CallableRequest<GetInvoicesData>) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const userId = request.auth.uid;
  const { limit = 10 } = request.data || {};

  try {
    const invoicesSnapshot = await db
      .collection('invoices')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const invoices = invoicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { invoices };
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get invoices'
    );
  }
});