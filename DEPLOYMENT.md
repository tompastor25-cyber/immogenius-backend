# 🚀 Guide de déploiement - Immo Genius

Guide complet pour déployer et configurer Immo Genius en production.

---

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 12+
- Compte OpenAI (GPT-4 ou GPT-3.5-turbo)
- Compte Stripe
- Email sender (Gmail, SendGrid, etc.)

---

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │ (HTML/CSS/JS statique)
│  (Browser)  │
└──────┬──────┘
       │ API calls
       ▼
┌──────────────────────────────────┐
│    Node.js/Express Server        │
│  ┌────────────────────────────┐  │
│  │  Routes API                │  │
│  │  - Auth                    │  │
│  │  - Content (OpenAI)        │  │
│  │  - Payment (Stripe)        │  │
│  └────────────────────────────┘  │
└──────┬───────────────────────────┘
       │
       ├─ PostgreSQL (Données)
       ├─ OpenAI API (Génération)
       ├─ Stripe API (Paiements)
       └─ Email Service (Notifications)
```

---

## 📦 Installation locale (Développement)

### 1. Cloner le projet

```bash
git clone https://github.com/yourusername/immo-genius.git
cd immo-genius
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer PostgreSQL

```bash
# Créer une base de données
createdb immogenius

# Ou avec PostgreSQL en Docker:
docker run --name postgres-immo \
  -e POSTGRES_DB=immogenius \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Remplir le fichier .env

```bash
cp .env.example .env
```

Éditer `.env` avec vos vraies clés:

```env
# DATABASE
DATABASE_URL="postgresql://user:password@localhost:5432/immogenius"

# JWT
JWT_SECRET="your_super_secret_jwt_key_minimum_32_chars"

# OPENAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4"

# STRIPE
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# APPLICATION
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3000"
```

### 5. Créer les tables

```bash
# Avec Prisma
npx prisma db push

# Ou avec migrations
npx prisma migrate dev --name init
```

### 6. Créer les utilisateurs de test

```bash
node scripts/setupDb.js
```

### 7. Démarrer le serveur

```bash
npm start

# Ou en développement (avec hot-reload)
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

---

## 🔑 Configuration des APIs externes

### OpenAI

1. **Créer un compte:** https://platform.openai.com
2. **Créer une clé API:** https://platform.openai.com/account/api-keys
3. **Ajouter à .env:**
   ```env
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4
   ```
4. **Ajouter du crédit:** https://platform.openai.com/account/billing/overview

### Stripe

1. **Créer un compte:** https://dashboard.stripe.com/register
2. **Récupérer les clés** depuis Dashboard → Developers → API keys
3. **Créer les produits:**
   - Plan Solo: 39€/mois
   - Plan Agence: 99€/mois
   - Obtenir les `price_id`
4. **Configurer les webhooks:**
   - URL: `https://votre-domaine.com/api/payment/webhook`
   - Events: 
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
5. **Ajouter à .env:**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Google OAuth (optionnel)

Voir `OAUTH_SETUP.md`

---

## 🚀 Déploiement en production

### Option 1: Heroku (Gratuit, simple)

```bash
# 1. Installer Heroku CLI
npm install -g heroku

# 2. Se connecter
heroku login

# 3. Créer l'app
heroku create immo-genius

# 4. Ajouter PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# 5. Définir les variables d'environnement
heroku config:set JWT_SECRET="..."
heroku config:set OPENAI_API_KEY="..."
heroku config:set STRIPE_SECRET_KEY="..."
# ... etc pour toutes les variables

# 6. Pousser le code
git push heroku main

# 7. Lancer les migrations
heroku run npx prisma db push

# 8. Vérifier
heroku logs --tail
```

### Option 2: Railway (Recommandé, très simple)

1. **Aller à** https://railway.app
2. **Connecter GitHub**
3. **Créer un nouveau projet**
4. **Ajouter PostgreSQL** depuis le marketplace
5. **Configurer les variables d'environnement** via Dashboard
6. **Deploy automatique** depuis Git push

### Option 3: DigitalOcean (Puissance, contrôle total)

```bash
# 1. Créer un Droplet (Node.js 18, Ubuntu 22.04)
# 2. SSH sur le serveur
ssh root@your-ip

# 3. Installer Node.js et PostgreSQL
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib

# 4. Cloner le repo
git clone https://github.com/yourusername/immo-genius.git
cd immo-genius

# 5. Installer les dépendances
npm install --production

# 6. Créer la base de données
sudo -u postgres createdb immogenius

# 7. Configurer .env
nano .env  # Éditer avec vos variables

# 8. Lancer avec PM2
npm install -g pm2
pm2 start server.js --name "immo-genius"
pm2 startup
pm2 save

# 9. Configurer Nginx comme reverse proxy
sudo apt-get install -y nginx

# Créer /etc/nginx/sites-available/immo-genius:
upstream immo_genius {
  server 127.0.0.1:3000;
}

server {
  listen 80;
  server_name votre-domaine.com;

  location / {
    proxy_pass http://immo_genius;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Activer le site
sudo ln -s /etc/nginx/sites-available/immo-genius /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 10. Configurer SSL (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## ✅ Checklist pré-production

### Sécurité
- [ ] HTTPS/SSL activé
- [ ] Secrets en variables d'environnement
- [ ] Rate limiting configuré
- [ ] CORS restrictif (pas `*`)
- [ ] Helmet middleware activé
- [ ] Authentification JWT fonctionnelle
- [ ] Validations d'entrée en place
- [ ] Logs de sécurité actifs

### Performance
- [ ] Database indexée
- [ ] Compression gzip activée
- [ ] Caching configuré
- [ ] Images optimisées
- [ ] CSS/JS minifiés

### Base de données
- [ ] Backups configurées
- [ ] Migrations testées
- [ ] Indices créés
- [ ] Connexions poolées

### Paiements
- [ ] Webhook Stripe testé
- [ ] Plans Stripe créés
- [ ] Transition prod/test prête
- [ ] Factures configurées

### Email (optionnel)
- [ ] Service configuré (Gmail, SendGrid)
- [ ] Templates d'email
- [ ] Logging des envois

### Monitoring
- [ ] Sentry ou simil. pour les erreurs
- [ ] Logs centralisés (LogRocket, DataDog)
- [ ] Alertes en place
- [ ] Dashboard de monitoring

### Code
- [ ] Tests passent
- [ ] Linting OK (`npm run lint`)
- [ ] Documentation à jour
- [ ] Version taggée dans Git

---

## 📊 Monitoring en production

### Logs
```bash
# Heroku
heroku logs --tail

# DigitalOcean (PM2)
pm2 logs

# Docker
docker logs immo-genius
```

### Métrics
- Erreurs non capturées → Sentry
- Performance → New Relic, DataDog
- Base de données → CloudSQL, pgAdmin
- Stripe webhooks → Stripe Dashboard

---

## 🔄 Mise à jour en production

```bash
# 1. Tester localement
npm test

# 2. Créer une branche
git checkout -b feature/new-feature

# 3. Commiter et pousser
git commit -am "feat: new feature"
git push origin feature/new-feature

# 4. Créer une PR
# (Reviewer la approuve)

# 5. Merger vers main
git checkout main
git merge feature/new-feature
git push origin main

# 6. Déploiement automatique (CI/CD)
# Heroku/Railway déploient automatiquement
# (Vérifier les logs)

# 7. Vérifier
curl https://votre-domaine.com/api/health
```

---

## 🐛 Troubleshooting

### Erreur: "ECONNREFUSED" pour PostgreSQL
```bash
# Vérifier que PostgreSQL est en cours d'exécution
psql --version
sudo systemctl status postgresql

# Redémarrer
sudo systemctl restart postgresql
```

### Erreur: "OpenAI API key invalid"
```bash
# Vérifier la clé
echo $OPENAI_API_KEY

# Vérifier les credits: https://platform.openai.com/account/usage/overview
```

### Erreur: "Stripe webhook signature verification failed"
```bash
# Redémarrer le webhook depuis Stripe Dashboard
# Vérifier que STRIPE_WEBHOOK_SECRET est correct
```

### Performance lente
```bash
# Vérifier les logs lents
heroku logs --tail --ps api

# Analyser les requêtes DB
# (Activer query logging dans .env)

# Ajouter un index
npx prisma db execute --stdin <<EOF
CREATE INDEX idx_user_created_at ON users(created_at);
EOF
```

---

## 📚 Ressources

- [Node.js Docs](https://nodejs.org/docs/)
- [Express Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Stripe Docs](https://stripe.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Good luck! 🚀**
