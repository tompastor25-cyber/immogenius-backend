// Routes de paiement Stripe

import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth.js';
import * as stripeService from '../services/stripe.js';
import  prisma  from '../utils/db.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payment/create-checkout-session
 * Crée une session Stripe Checkout
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  const { plan } = req.body;

  if (!['solo', 'agency', 'pro_plus'].includes(plan)) {
    return res.status(400).json({
      success: false,
      message: 'Plan invalide'
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const result = await stripeService.createCheckoutSession(req.user.id, plan, user);

    return res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[Payment] Create checkout session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session'
    });
  }
});

/**
 * GET /api/payment/checkout-session/:sessionId
 * Récupère les détails d'une session Checkout
 */
router.get('/checkout-session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const session = await stripeService.getCheckoutSession(req.params.sessionId);

    // Vérifier que la session appartient à l'utilisateur
    if (session.metadata?.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    return res.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_email
      }
    });
  } catch (error) {
    console.error('[Payment] Get checkout session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/payment/webhook
 * Webhook Stripe pour traiter les événements de paiement
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return res.sendStatus(400);
  }

  try {
    // Traiter l'événement
    await stripeService.handleStripeWebhook(event);

    // Sauvegarder l'événement
    await prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        data: event.data.object,
        processed: true
      }
    });

    return res.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error handling event:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook'
    });
  }
});

/**
 * GET /api/payment/invoices
 * Récupère les factures de l'utilisateur
 */
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const result = await stripeService.getUserInvoices(req.user.id);

    return res.json(result);
  } catch (error) {
    console.error('[Payment] Get invoices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des factures'
    });
  }
});

/**
 * POST /api/payment/cancel-subscription
 * Annule l'abonnement de l'utilisateur
 */
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { subscriptionId: true }
    });

    if (!user?.subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Aucun abonnement actif'
      });
    }

    const result = await stripeService.cancelSubscription(user.subscriptionId);

    return res.json({
      success: true,
      message: 'Abonnement annulé',
      subscription: result.subscription
    });
  } catch (error) {
    console.error('[Payment] Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'annulation'
    });
  }
});

/**
 * GET /api/payment/subscription-status
 * Récupère le statut de l'abonnement
 */
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        plan: true,
        subscriptionId: true,
        subscriptionStart: true,
        subscriptionEnd: true,
        trialEnd: true,
        generationsUsed: true
      }
    });

    const now = new Date();
    let status = 'active';
    let daysRemaining = 0;

    if (user.plan === 'free_trial') {
      if (user.trialEnd && new Date(user.trialEnd) < now) {
        status = 'trial_expired';
      } else if (user.trialEnd) {
        status = 'trial_active';
        daysRemaining = Math.ceil((new Date(user.trialEnd) - now) / (1000 * 60 * 60 * 24));
      }
    } else if (user.subscriptionEnd && new Date(user.subscriptionEnd) < now) {
      status = 'expired';
    }

    return res.json({
      success: true,
      subscription: {
        plan: user.plan,
        status: status,
        daysRemaining: daysRemaining,
        start: user.subscriptionStart,
        end: user.subscriptionEnd || user.trialEnd,
        generationsUsed: user.generationsUsed
      }
    });
  } catch (error) {
    console.error('[Payment] Get status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router;
