// Routes pour la génération de contenu IA

import express from 'express';
import { authenticateToken, requireValidPlan, rateLimitPerUser } from '../middleware/auth.js';
import { prisma } from '../utils/db.js';
import * as openaiService from '../services/openai.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Rate limiting: 10 générations par heure par utilisateur
const generateRateLimit = rateLimitPerUser(10, 60 * 60 * 1000);

/**
 * POST /api/content/generate-listing
 * Génère une annonce immobilière
 */
router.post(
  '/generate-listing',
  authenticateToken,
  requireValidPlan,
  generateRateLimit,
  [
    body('address').trim().notEmpty(),
    body('surface').isInt({ min: 10, max: 10000 }),
    body('rooms').isInt({ min: 1, max: 20 }),
    body('type').trim().notEmpty(),
    body('condition').isIn(['poor', 'fair', 'good', 'excellent'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { address, surface, rooms, type, condition, style = 'professional', highlights } = req.body;

    try {
      // Générer avec OpenAI
      const result = await openaiService.generateListing(
        { address, surface, rooms, type, condition, highlights },
        style
      );

      // Sauvegarder en BD
      const content = await prisma.generatedContent.create({
        data: {
          userId: req.user.id,
          type: 'listing',
          originalInput: JSON.stringify(req.body),
          generatedOutput: JSON.stringify(result.content),
          style: style,
          tokens: result.tokens,
          cost: result.cost
        }
      });

      // Mettre à jour le compteur d'utilisation
      await prisma.user.update({
        where: { id: req.user.id },
        data: { generationsUsed: { increment: 1 } }
      });

      return res.json({
        success: true,
        content: {
          id: content.id,
          ...result.content,
          createdAt: content.createdAt
        },
        tokens: result.tokens,
        cost: result.cost
      });
    } catch (error) {
      console.error('[Content] Generate listing error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la génération'
      });
    }
  }
);

/**
 * POST /api/content/generate-message
 * Génère un message client
 */
router.post(
  '/generate-message',
  authenticateToken,
  requireValidPlan,
  generateRateLimit,
  [
    body('clientName').trim(),
    body('property').trim().notEmpty(),
    body('context').isIn(['follow_up', 'new_contact', 'closing', 'objection'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { clientName, property, context } = req.body;

    try {
      const result = await openaiService.generateClientMessage(
        { name: clientName, property, context },
        context
      );

      const content = await prisma.generatedContent.create({
        data: {
          userId: req.user.id,
          type: 'message',
          originalInput: JSON.stringify(req.body),
          generatedOutput: JSON.stringify(result.messages),
          tokens: result.tokens,
          cost: result.cost
        }
      });

      await prisma.user.update({
        where: { id: req.user.id },
        data: { generationsUsed: { increment: 1 } }
      });

      return res.json({
        success: true,
        content: {
          id: content.id,
          ...result.messages,
          createdAt: content.createdAt
        },
        tokens: result.tokens,
        cost: result.cost
      });
    } catch (error) {
      console.error('[Content] Generate message error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la génération'
      });
    }
  }
);

/**
 * POST /api/content/generate-social
 * Génère des posts réseaux sociaux
 */
router.post(
  '/generate-social',
  authenticateToken,
  requireValidPlan,
  generateRateLimit,
  [
    body('address').trim().notEmpty(),
    body('platform').isIn(['instagram', 'facebook', 'linkedin']),
    body('type').trim().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { address, platform, type, highlights } = req.body;

    try {
      const result = await openaiService.generateSocialPost(
        { address, type, highlights },
        platform
      );

      const content = await prisma.generatedContent.create({
        data: {
          userId: req.user.id,
          type: 'social_post',
          platform: platform,
          originalInput: JSON.stringify(req.body),
          generatedOutput: JSON.stringify(result.posts),
          tokens: result.tokens,
          cost: result.cost
        }
      });

      await prisma.user.update({
        where: { id: req.user.id },
        data: { generationsUsed: { increment: 1 } }
      });

      return res.json({
        success: true,
        content: {
          id: content.id,
          posts: result.posts,
          platform: result.platform,
          createdAt: content.createdAt
        },
        tokens: result.tokens,
        cost: result.cost
      });
    } catch (error) {
      console.error('[Content] Generate social error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la génération'
      });
    }
  }
);

/**
 * POST /api/content/generate-estimation
 * Génère une estimation de prix
 */
router.post(
  '/generate-estimation',
  authenticateToken,
  requireValidPlan,
  generateRateLimit,
  [
    body('location').trim().notEmpty(),
    body('surface').isInt({ min: 10, max: 10000 }),
    body('rooms').isInt({ min: 1, max: 20 }),
    body('type').trim().notEmpty(),
    body('condition').isIn(['poor', 'fair', 'good', 'excellent'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { location, surface, rooms, type, condition, year } = req.body;

    try {
      const result = await openaiService.generatePriceEstimation({
        location, surface, rooms, type, condition, year
      });

      const content = await prisma.generatedContent.create({
        data: {
          userId: req.user.id,
          type: 'estimation',
          originalInput: JSON.stringify(req.body),
          generatedOutput: JSON.stringify(result.estimation),
          tokens: result.tokens,
          cost: result.cost
        }
      });

      await prisma.user.update({
        where: { id: req.user.id },
        data: { generationsUsed: { increment: 1 } }
      });

      return res.json({
        success: true,
        content: {
          id: content.id,
          ...result.estimation,
          disclaimer: result.disclaimer,
          createdAt: content.createdAt
        },
        tokens: result.tokens,
        cost: result.cost
      });
    } catch (error) {
      console.error('[Content] Generate estimation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Erreur lors de la génération'
      });
    }
  }
);

/**
 * GET /api/content/history
 * Récupère l'historique de génération
 */
router.get('/history', authenticateToken, async (req, res) => {
  const { type, limit = 20, skip = 0 } = req.query;

  try {
    const where = {
      userId: req.user.id,
      ...(type && { type })
    };

    const contents = await prisma.generatedContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(skip)
    });

    const total = await prisma.generatedContent.count({ where });

    return res.json({
      success: true,
      contents,
      total,
      hasMore: skip + parseInt(limit) < total
    });
  } catch (error) {
    console.error('[Content] Get history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * GET /api/content/:id
 * Récupère un contenu généré par ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const content = await prisma.generatedContent.findUnique({
      where: { id: req.params.id }
    });

    if (!content || content.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Contenu non trouvé'
      });
    }

    return res.json({
      success: true,
      content: {
        ...content,
        generatedOutput: JSON.parse(content.generatedOutput),
        originalInput: JSON.parse(content.originalInput)
      }
    });
  } catch (error) {
    console.error('[Content] Get content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * DELETE /api/content/:id
 * Supprime un contenu généré
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const content = await prisma.generatedContent.findUnique({
      where: { id: req.params.id }
    });

    if (!content || content.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Contenu non trouvé'
      });
    }

    await prisma.generatedContent.delete({
      where: { id: req.params.id }
    });

    return res.json({
      success: true,
      message: 'Contenu supprimé'
    });
  } catch (error) {
    console.error('[Content] Delete content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

export default router;
