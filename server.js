/**
 * IMMO GENIUS - Server complet
 * Backend avec authentification JWT, OpenAI, Stripe, PostgreSQL
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
dotenv.config();

// Routes
import authRouter from './src/routes/auth.js';
import contentRouter from './src/routes/content.js';
import paymentRouter from './src/routes/payment.js';

// Utils
import prisma from "./src/utils/db.js";

// Configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARE DE SÉCURITÉ
// ============================================

// Helmet pour les headers de sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true
}));

// Parser JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// ============================================
// MIDDLEWARE DE LOGGING
// ============================================

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Immo Genius API',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API ROUTES
// ============================================

// Authentification
app.use('/api/auth', authRouter);

// Contenu IA
app.use('/api/content', contentRouter);

// Paiements
app.use('/api/payment', paymentRouter);

// ============================================
// ROUTES STATIQUES (Pages HTML)
// ============================================

const htmlPages = [
  { path: '/', file: 'index.html' },
  { path: '/features', file: 'features.html' },
  { path: '/pricing', file: 'pricing.html' },
  { path: '/faq', file: 'faq.html' },
  { path: '/contact', file: 'contact.html' },
  { path: '/auth', file: 'auth.html' },
  { path: '/auth-callback', file: 'auth-callback.html' }
];

htmlPages.forEach(({ path: pathStr, file }) => {
  app.get(pathStr, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.path
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('[Error]', err);

  res.status(err.status || 500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Erreur serveur' : err.message,
    ...(NODE_ENV !== 'production' && { error: err.stack })
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

async function startServer() {
  try {
    // Tester la connexion à la BD
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connexion PostgreSQL établie');

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║          IMMO GENIUS - SERVER DÉMARRÉ ✅               ║
╚════════════════════════════════════════════════════════╝

🌐 Serveur: http://localhost:${PORT}
📊 Environnement: ${NODE_ENV}

📋 Routes API:
   POST   /api/auth/signup              → Inscription
   POST   /api/auth/login               → Connexion
   GET    /api/auth/me                  → Profil actuel
   PUT    /api/auth/profile             → Mettre à jour profil
   POST   /api/auth/change-password     → Changer mot de passe

📝 Génération de contenu:
   POST   /api/content/generate-listing     → Annonce immobilière
   POST   /api/content/generate-message     → Message client
   POST   /api/content/generate-social      → Post réseaux
   POST   /api/content/generate-estimation  → Estimation prix
   GET    /api/content/history              → Historique
   GET    /api/content/:id                  → Détail
   DELETE /api/content/:id                  → Supprimer

💳 Paiements:
   POST   /api/payment/create-checkout-session    → Créer session
   GET    /api/payment/checkout-session/:id       → Détails session
   POST   /api/payment/webhook                    → Webhook Stripe
   GET    /api/payment/invoices                   → Factures
   POST   /api/payment/cancel-subscription        → Annuler abonnement
   GET    /api/payment/subscription-status        → Statut abonnement

🔐 Configuration requise:
   ✅ DATABASE_URL (PostgreSQL)
   ✅ JWT_SECRET
   ✅ OPENAI_API_KEY
   ✅ STRIPE_SECRET_KEY
   ✅ STRIPE_WEBHOOK_SECRET

⚠️  Assurez-vous que .env est rempli correctement!

📚 Documentation: https://github.com/yourusername/immo-genius
🆘 Support: contact@immogenius.fr
      `);
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:');
    console.error(error);
    process.exit(1);
  }
}

startServer();

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur (SIGTERM)...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
