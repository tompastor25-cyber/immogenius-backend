// Service Stripe pour les paiements et abonnements

import Stripe from 'stripe';
import { prisma } from '../utils/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Prix des plans en centimes EUR
const PLANS = {
  solo: {
    priceId: 'price_solo_monthly',  // À configurer dans Stripe
    amount: 3900,  // 39€
    name: 'Solo'
  },
  agency: {
    priceId: 'price_agency_monthly',  // À configurer dans Stripe
    amount: 9900,  // 99€
    name: 'Agence'
  }
};

/**
 * Crée une session de paiement Stripe Checkout
 */
export async function createCheckoutSession(userId, plan, user) {
  if (!PLANS[plan]) {
    throw new Error('Plan invalide');
  }

  const planConfig = PLANS[plan];

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.CORS_ORIGIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CORS_ORIGIN}/pricing`,
      metadata: {
        userId: userId,
        plan: plan
      }
    });

    return {
      success: true,
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'une session Stripe
 */
export async function getCheckoutSession(sessionId) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('[Stripe] Error retrieving session:', error);
    throw error;
  }
}

/**
 * Crée un client Stripe et un abonnement
 */
export async function createSubscription(userId, user, plan) {
  if (!PLANS[plan]) {
    throw new Error('Plan invalide');
  }

  const planConfig = PLANS[plan];

  try {
    // 1. Créer un client Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: userId
      }
    });

    // 2. Créer un abonnement
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: planConfig.priceId
        }
      ],
      metadata: {
        userId: userId,
        plan: plan
      }
    });

    // 3. Sauvegarder dans la BD
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan,
        subscriptionId: subscription.id,
        subscriptionStart: new Date(subscription.current_period_start * 1000),
        subscriptionEnd: new Date(subscription.current_period_end * 1000)
      }
    });

    return {
      success: true,
      subscription: subscription
    };
  } catch (error) {
    console.error('[Stripe] Error creating subscription:', error);
    throw error;
  }
}

/**
 * Traite un webhook Stripe
 */
export async function handleStripeWebhook(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutComplete(event.data.object);

    case 'customer.subscription.updated':
      return handleSubscriptionUpdate(event.data.object);

    case 'customer.subscription.deleted':
      return handleSubscriptionDelete(event.data.object);

    case 'invoice.payment_succeeded':
      return handleInvoicePaid(event.data.object);

    case 'invoice.payment_failed':
      return handleInvoiceFailed(event.data.object);

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Gère la completion du checkout
 */
async function handleCheckoutComplete(session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;

  if (!userId || !plan) {
    throw new Error('Missing userId or plan in metadata');
  }

  try {
    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan,
        subscriptionId: session.subscription,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // +30 jours
      }
    });

    // Sauvegarder l'événement Stripe
    await prisma.stripeEvent.create({
      data: {
        stripeEventId: session.id,
        type: 'checkout.session.completed',
        data: session,
        processed: true
      }
    });

    console.log(`[Stripe] Checkout completed for user ${userId}, plan ${plan}`);
  } catch (error) {
    console.error('[Stripe] Error handling checkout complete:', error);
    throw error;
  }
}

/**
 * Gère la mise à jour de l'abonnement
 */
async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionEnd: new Date(subscription.current_period_end * 1000)
      }
    });

    console.log(`[Stripe] Subscription updated for user ${userId}`);
  } catch (error) {
    console.error('[Stripe] Error handling subscription update:', error);
  }
}

/**
 * Gère la suppression de l'abonnement
 */
async function handleSubscriptionDelete(subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: 'free_trial',
        subscriptionId: null,
        subscriptionEnd: new Date()
      }
    });

    console.log(`[Stripe] Subscription deleted for user ${userId}`);
  } catch (error) {
    console.error('[Stripe] Error handling subscription delete:', error);
  }
}

/**
 * Gère la facture payée
 */
async function handleInvoicePaid(invoice) {
  const userId = invoice.metadata?.userId;

  if (!userId) return;

  try {
    await prisma.billingHistory.create({
      data: {
        userId: userId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        status: 'paid',
        billingPeriod: new Date(invoice.period_start * 1000),
        dueDate: new Date(invoice.due_date * 1000)
      }
    });

    console.log(`[Stripe] Invoice paid for user ${userId}`);
  } catch (error) {
    console.error('[Stripe] Error handling invoice paid:', error);
  }
}

/**
 * Gère l'échec du paiement de la facture
 */
async function handleInvoiceFailed(invoice) {
  const userId = invoice.metadata?.userId;

  if (!userId) return;

  try {
    await prisma.billingHistory.create({
      data: {
        userId: userId,
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due / 100,
        status: 'failed',
        billingPeriod: new Date(invoice.period_start * 1000),
        dueDate: new Date(invoice.due_date * 1000)
      }
    });

    console.log(`[Stripe] Invoice failed for user ${userId}`);
  } catch (error) {
    console.error('[Stripe] Error handling invoice failed:', error);
  }
}

/**
 * Annule un abonnement
 */
export async function cancelSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    return { success: true, subscription };
  } catch (error) {
    console.error('[Stripe] Error canceling subscription:', error);
    throw error;
  }
}

/**
 * Récupère les factures d'un utilisateur
 */
export async function getUserInvoices(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionId: true }
    });

    if (!user?.subscriptionId) {
      return { success: true, invoices: [] };
    }

    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    const invoices = await stripe.invoices.list({
      customer: subscription.customer,
      limit: 50
    });

    return {
      success: true,
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        amount: inv.amount_paid / 100,
        status: inv.status,
        date: new Date(inv.created * 1000),
        url: inv.invoice_pdf
      }))
    };
  } catch (error) {
    console.error('[Stripe] Error getting user invoices:', error);
    throw error;
  }
}
