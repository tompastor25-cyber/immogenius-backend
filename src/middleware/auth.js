// Middleware d'authentification JWT

import jwt from 'jsonwebtoken';

/**
 * Vérifie le JWT token et attache l'utilisateur à req.user
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Vérifie que l'utilisateur est admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Accès administrateur requis'
    });
  }

  next();
};

/**
 * Vérifie que l'utilisateur a un plan valide (pas en trial expiré)
 */
export const requireValidPlan = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  const now = new Date();

  // Si trial et expiré
  if (req.user.plan === 'free_trial' && req.user.trialEnd && new Date(req.user.trialEnd) < now) {
    return res.status(403).json({
      success: false,
      message: 'Trial expiré. Veuillez souscrire à un plan payant.'
    });
  }

  // Si subscription et expirée
  if (req.user.subscriptionEnd && new Date(req.user.subscriptionEnd) < now) {
    return res.status(403).json({
      success: false,
      message: 'Abonnement expiré'
    });
  }

  next();
};

/**
 * Rate limiting per user
 */
export const rateLimitPerUser = (limit = 10, windowMs = 60000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();

    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);
    const validRequests = requests.filter(time => now - time < windowMs);
    validRequests.push(now);

    if (validRequests.length > limit) {
      return res.status(429).json({
        success: false,
        message: 'Trop de requêtes. Réessayez plus tard.'
      });
    }

    userRequests.set(userId, validRequests);
    next();
  };
};
