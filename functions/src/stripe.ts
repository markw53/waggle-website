import * as functions from 'firebase-functions';
import { defineString } from 'firebase-functions/params';
import Stripe from 'stripe';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { CallableRequest } from 'firebase-functions/v2/https';

// Define environment parameters
const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineString('STRIPE_WEBHOOK_SECRET');
const stripeStandardMonthlyPriceId = defineString('STRIPE_STANDARD_MONTHLY_PRICE_ID');
const stripeStandardYearlyPriceId = defineString('STRIPE_STANDARD_YEARLY_PRICE_ID');
const stripePremiumMonthlyPriceId = defineString('STRIPE_PREMIUM_MONTHLY_PRICE_ID');
const stripePremiumYearlyPriceId = defineString('STRIPE_PREMIUM_YEARLY_PRICE_ID');

const db = getFirestore();

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
 * Save invoice to Firestore
 */
async function saveInvoiceToFirestore(userId: string, invoice: Stripe.Invoice) {
  const invoiceWithExtras = invoice as any;
  
  const invoiceData = {
    userId,
    stripeInvoiceId: invoice.id,
    stripeCustomerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '',
    subscriptionId: typeof invoiceWithExtras.subscription === 'string' ? invoiceWithExtras.subscription : null,
    status: invoice.status || 'draft',
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    periodStart: Timestamp.fromDate(new Date(invoice.period_start * 1000)),
    periodEnd: Timestamp.fromDate(new Date(invoice.period_end * 1000)),
    invoiceUrl: invoice.invoice_pdf || null,
    invoicePdf: invoice.invoice_pdf || null,
    hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    paymentIntentId: typeof invoiceWithExtras.payment_intent === 'string' ? invoiceWithExtras.payment_intent : null,
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
    status: subscription.status as any,
    currentPeriodStart: Timestamp.fromDate(new Date((subscription as any).current_period_start * 1000)),
    currentPeriodEnd: Timestamp.fromDate(new Date((subscription as any).current_period_end * 1000)),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    trialEnd: (subscription as any).trial_end 
      ? Timestamp.fromDate(new Date((subscription as any).trial_end * 1000))
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

  const invoiceWithSub = invoice as any;
  if (!userId && invoiceWithSub.subscription && typeof invoiceWithSub.subscription === 'string') {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(invoiceWithSub.subscription);
    userId = subscription.metadata?.userId;
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

  const invoiceWithSub = invoice as any;
  if (!userId && invoiceWithSub.subscription && typeof invoiceWithSub.subscription === 'string') {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(invoiceWithSub.subscription);
    userId = subscription.metadata?.userId;
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

  const invoiceWithSub = invoice as any;
  const subscriptionId = invoiceWithSub.subscription;
  
  if (!subscriptionId || typeof subscriptionId !== 'string') {
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
    customerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '',
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

  const invoiceWithSub = invoice as any;
  const subscriptionId = invoiceWithSub.subscription;
  
  if (!subscriptionId || typeof subscriptionId !== 'string') {
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
    customerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '',
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
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
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
    status: 'cancelled',
    cancelAtPeriodEnd: false,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart: Timestamp.fromDate(new Date((subscription as any).current_period_start * 1000)),
    currentPeriodEnd: Timestamp.fromDate(new Date((subscription as any).current_period_end * 1000)),
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

    let customerId = userData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email,
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
    const customerId = userDoc.data()?.stripeCustomerId;

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

    const subscription = subscriptionDoc.data();

    return {
      subscription: subscription || null,
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