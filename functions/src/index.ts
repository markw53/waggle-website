import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onDocumentCreated, FirestoreEvent, QueryDocumentSnapshot } 
  from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import sgMail from '@sendgrid/mail';
import * as functions from 'firebase-functions/v1';

initializeApp();
const db = getFirestore();

const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY');

export const sendMatchNotification = onDocumentCreated(
  {
    document: 'matches/{matchId}',
    secrets: [SENDGRID_API_KEY],
  },
  async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>) => {
    const snap = event.data;
    if (!snap) {
      logger.warn('No snapshot data found.');
      return;
    }

    const match = snap.data();
    if (!match?.createdBy) {
      logger.warn('Invalid match data');
      return;
    }

    sgMail.setApiKey(SENDGRID_API_KEY.value());

    const ownerSnap = await db.doc(`users/${match.createdBy}`).get();
    if (!ownerSnap.exists) {
      logger.warn(`User ${match.createdBy} not found`);
      return;
    }

    const owner = ownerSnap.data()!;
    const msg = {
      to: owner.email,
      from: 'noreply@waggle-app.com',
      subject: '🎉 You Have a New Match on Waggle!',
      text: `Your dogs ${match.dog1} and ${match.dog2} have a new match!`,
      html: `<p>Hi ${owner.displayName || 'Dog Lover'},</p>
             <p>A new match has been created between <b>${match.dog1}</b> and <b>${match.dog2}</b>.</p>`,
    };

    try {
      await sgMail.send(msg);
      logger.info(`Notification email sent to ${owner.email}`);
    } catch (err) {
      logger.error('Error sending email:', err);
    }
  }
);

export const createDefaultSubscription = functions.auth.user().onCreate(async (user) => {
  try {
    logger.info(`Creating default subscription for user ${user.uid}`);
    
    await db.collection('users').doc(user.uid).set({
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }, { merge: true });

      await db
      .collection('users')
      .doc(user.uid)
      .collection('subscription')
      .doc('current')
      .set({
        userId: user.uid,
        tier: 'free',
        status: 'active',
        currentPeriodStart: Timestamp.now(),
        currentPeriodEnd: Timestamp.fromDate(
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        ),
        cancelAtPeriodEnd: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    
    logger.info(`Successfully created default subscription for user ${user.uid}`);
  } catch (error) {
    logger.error('Error creating default subscription:', error);
  }
});

export {
  stripeWebhook,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  getUserInvoices,
} from './stripe.js';