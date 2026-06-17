// Utilitaires JWT

import jwt from 'jsonwebtoken';

/**
 * Génère un JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    isAdmin: user.isAdmin
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Vérifie et décode un JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Décodes un token sans vérification (pour les refresh tokens)
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
