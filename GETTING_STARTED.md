# 🚀 Guide de démarrage rapide - Immo Genius

Vous avez un **site web complet avec backend**. Voici comment le lancer en 10 minutes.

---

## ⚡ Démarrage ultra-rapide (5 min)

### 1. Télécharger et installer

```bash
# Si vous n'avez pas cloné le repo
git clone https://github.com/yourusername/immo-genius.git
cd immo-genius

# Installer les dépendances
npm install
```

### 2. Configurer PostgreSQL

**Option A: PostgreSQL local**
```bash
# Créer une base de données
createdb immogenius
```

**Option B: Docker (recommandé)**
```bash
docker run --name postgres-immo \
  -e POSTGRES_DB=immogenius \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Remplir .env (version minimale)

```bash
# Copier le template
cp .env.example .env

# Éditer .env avec ces valeurs MINIMALES:
DATABASE_URL="postgresql://postgres:password123@localhost:5432/immogenius"
JWT_SECRET="your-super-secret-key-minimum-32-characters-long-12345"
OPENAI_API_KEY="sk-your-openai-key-here"
STRIPE_SECRET_KEY="sk_test_your-stripe-key"
NODE_ENV="development"
```

### 4. Créer les tables et données de test

```bash
# Créer les tables avec Prisma
npx prisma db push

# Créer les utilisateurs de test
node scripts/setupDb.js
```

### 5. Lancer le serveur

```bash
npm start
```

✅ **Bravo!** Ouvrez `http://localhost:3000`

---

## 📝 Comptes de test prêts à l'emploi

Après avoir exécuté `setupDb.js`, vous pouvez vous connecter avec:

```
Email: agent@immobilier.fr
Mot de passe: password123

Email: agence@immobilier.fr
Mot de passe: password123
```

---

## 🧪 Tester les fonctionnalités

### 1. Authentification

```bash
# S'inscrire
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "structure": "independent"
  }'

# Réponse: vous recevez un token JWT

# Se connecter
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Récupérer le profil (remplacer TOKEN)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### 2. Générer une annonce (avec OpenAI)

```bash
# Remplacer TOKEN par votre JWT
curl -X POST http://localhost:3000/api/content/generate-listing \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Paris 8ème",
    "surface": 85,
    "rooms": 3,
    "type": "apartment",
    "condition": "excellent",
    "highlights": ["vue Eiffel", "balcon", "calme"]
  }'
```

### 3. Vérifier la santé du serveur

```bash
curl http://localhost:3000/api/health

# Réponse:
# {
#   "status": "ok",
#   "service": "Immo Genius API",
#   "version": "1.0.0"
# }
```

---

## 🔌 Intégrations externes (optionnel pour tester)

### OpenAI
Pour que la génération de contenu fonctionne:
1. Créer un compte: https://platform.openai.com
2. Copier votre clé API
3. Ajouter à .env: `OPENAI_API_KEY=sk-...`

Sans OpenAI: Les routes de génération retourneront une erreur.

### Stripe (pour les paiements)
Pour que les paiements fonctionnent:
1. Créer un compte: https://stripe.com
2. Aller à Dashboard → Developers → API keys
3. Copier `Secret Key`
4. Ajouter à .env: `STRIPE_SECRET_KEY=sk_test_...`

Sans Stripe: Les routes de paiement retourneront une erreur.

---

## 📚 Structure du projet

```
immo-genius/
├── index.html              ← Page d'accueil
├── server.js               ← Serveur principal
├── package.json
├── .env                    ← Vos secrets (créé depuis .env.example)
├── prisma/
│   └── schema.prisma       ← Schéma de la base de données
├── src/
│   ├── routes/             ← Routes API
│   │   ├── auth.js         ← Authentification
│   │   ├── content.js      ← Génération IA
│   │   └── payment.js      ← Paiements Stripe
│   ├── services/           ← Logique métier
│   │   ├── openai.js
│   │   └── stripe.js
│   ├── middleware/         ← Middleware Express
│   │   └── auth.js         ← JWT auth
│   └── utils/
│       ├── db.js           ← Connexion Prisma
│       └── jwt.js          ← Utilitaires JWT
└── scripts/
    └── setupDb.js          ← Script d'initialisation
```

---

## 🛠️ Développement

### Mode développement (avec hot reload)

```bash
npm run dev
```

### Lancer Prisma Studio (explorer la BD)

```bash
npx prisma studio
```

### Voir les logs SQL

Ajouter à `.env`:
```env
LOG_LEVEL=debug
```

---

## 📖 Documentation complète

| Fichier | Pour | Lien |
|---------|------|------|
| DEPLOYMENT.md | Déployer en production | [Lire](./DEPLOYMENT.md) |
| OAUTH_SETUP.md | Configurer Google/Microsoft Auth | [Lire](./OAUTH_SETUP.md) |
| CLAUDE.md | Notes internes et roadmap | [Lire](./CLAUDE.md) |
| README.md | Aperçu général | [Lire](./README.md) |

---

## ❌ Erreurs courantes

### "Cannot find module 'express'"
```bash
npm install
```

### "Can't reach database server"
```bash
# Vérifier PostgreSQL
psql --version
psql -U postgres -d immogenius -c "SELECT 1"

# Ou relancer Docker
docker ps
docker start postgres-immo
```

### "OPENAI_API_KEY is missing"
C'est normal en développement. Les routes de génération IA retourneront une erreur.
```bash
# Pour activer OpenAI:
# 1. Créer un compte: https://platform.openai.com
# 2. Copier votre clé API
# 3. Ajouter à .env
```

### "Port 3000 is already in use"
```bash
# Utiliser un autre port
PORT=3001 npm start

# Ou trouver et tuer le processus
lsof -i :3000
kill -9 <PID>
```

---

## ✅ Prochaines étapes

1. **Test du site** - Aller sur http://localhost:3000
2. **Se connecter** - Utiliser les comptes de test
3. **Générer du contenu** - Tester les routes API
4. **Configurer OpenAI** - Pour la vraie génération IA
5. **Configurer Stripe** - Pour les paiements
6. **Déployer** - Lire DEPLOYMENT.md

---

## 💬 Aide

Besoin d'aide?
- Lire la documentation complète: `README.md`
- Vérifier les erreurs: Consulter les logs (`npm start`)
- Questions? Email: contact@immogenius.fr

---

**Vous êtes prêt! 🚀 Commencez à développer!**
