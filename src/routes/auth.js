// Routes d'authentification

import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Inscription d'un nouvel utilisateur
 */
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('structure').isIn(['independent', 'agency', 'network'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password, name, structure } = req.body;

    try {
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          structure,
          plan: 'free_trial',
          trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // +7 jours
        }
      });

      // Générer le token
      const token = generateToken(user);

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'signup',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan
        },
        token
      });
    } catch (error) {
      console.error('[Auth] Signup error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier que le compte est actif
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé'
        });
      }

      // Générer le token
      const token = generateToken(user);

      // Mettre à jour lastLogin
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'login',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          trialEnd: user.trialEnd,
          subscriptionEnd: user.subscriptionEnd
        },
        token
      });
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
);

/**
 * POST /api/auth/logout
 * Déconnexion (supprime juste le token côté client)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // Log audit
  prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'logout',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }
  }).catch(err => console.error('[Audit] Error logging logout:', err));

  return res.json({
    success: true,
    message: 'Déconnecté'
  });
});

/**
 * GET /api/auth/me
 * Récupère le profil de l'utilisateur actuel
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        structure: true,
        plan: true,
        trialEnd: true,
        subscriptionEnd: true,
        subscriptionId: true,
        generationsUsed: true,
        createdAt: true,
        isAdmin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[Auth] Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Met à jour le profil de l'utilisateur
 */
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, phone, avatar } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatar && { avatar })
      }
    });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('[Auth] Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change le mot de passe
 */
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      // Vérifier le mot de passe actuel
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      // Hasher le nouveau mot de passe
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Mettre à jour
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash: newPasswordHash }
      });

      return res.json({
        success: true,
        message: 'Mot de passe changé'
      });
    } catch (error) {
      console.error('[Auth] Change password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
);

export default router;
