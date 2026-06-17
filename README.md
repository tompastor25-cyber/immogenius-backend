# 🏠 Immo Genius - SaaS IA pour Agents Immobiliers

Immo Genius est une **plateforme web complète** permettant aux agents immobiliers, agences et mandataires de **générer automatiquement** du contenu immobilier de qualité (annonces, messages clients, posts réseaux, estimations, etc.) grâce à l'IA.

---

## 📋 Table des matières

- [Caractéristiques](#caractéristiques)
- [Structure du projet](#structure-du-projet)
- [Installation et démarrage](#installation-et-démarrage)
- [Utilisation](#utilisation)
- [Déploiement](#déploiement)
- [Technologies](#technologies)
- [Documentation API](#documentation-api)
- [Roadmap](#roadmap)

---

## 🎯 Caractéristiques

✅ **Génération d'annonces immobilières** - Titres, descriptions longues/courtes optimisées SEO  
✅ **Messages clients automatisés** - WhatsApp, email, relances intelligentes  
✅ **Posts réseaux sociaux** - Instagram, Facebook, LinkedIn avec hashtags  
✅ **Rapports de visite** - Génération rapide et professionnelle  
✅ **Estimations de prix** - Fourchette + justification basée sur les caractéristiques  
✅ **Gestion des avis Google** - Réponses automatiques professionnelles  
✅ **Contrats simples** - Mandats, confidentialité (à faire valider juridiquement)  
✅ **Responsive design** - Fonctionne sur desktop, tablette, mobile  
✅ **7 jours gratuits** - Pas de carte bancaire requise  

---

## 🗂️ Structure du projet

```
immo-genius/
├── index.html              # Page d'accueil
├── features.html           # Fonctionnalités détaillées
├── pricing.html            # Tarifs et plans
├── faq.html                # Questions fréquentes
├── contact.html            # Formulaire contact / démo
├── auth.html               # Connexion / Inscription
├── css/
│   └── styles.css          # Tous les styles (responsive, thème)
├── js/
│   └── script.js           # Logique interactive (formulaires, accordion, etc.)
├── server.js               # Backend mock (Node.js/Express)
├── package.json            # Dépendances npm
├── README.md               # Cette documentation
└── .env (à créer)          # Variables d'environnement (optionnel)
```

---

## 🚀 Installation et démarrage

### Option 1: En tant que site statique (HTML/CSS/JS uniquement)

1. **Clonez le projet**
   ```bash
   git clone https://github.com/yourusername/immo-genius.git
   cd immo-genius
   ```

2. **Ouvrez simplement `index.html` dans votre navigateur**
   ```bash
   # Sous Windows
   start index.html

   # Sous macOS
   open index.html

   # Sous Linux
   xdg-open index.html
   ```

Aucune dépendance requise. Le site fonctionne entièrement côté client.

### Option 2: Avec le backend Node.js/Express (recommandé pour la production)

1. **Pré-requis**
   - Node.js v14+ installé ([télécharger](https://nodejs.org/))
   - npm ou yarn

2. **Installation des dépendances**
   ```bash
   npm install
   ```

3. **Démarrage du serveur**
   ```bash
   # Mode production
   npm start

   # Mode développement (avec hot-reload)
   npm run dev
   ```

4. **Accéder à l'application**
   ```
   http://localhost:3000
   ```

---

## 💻 Utilisation

### Pages principales

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Hero + bénéfices + fonctionnalités principales |
| Fonctionnalités | `/features` | Détail complet de chaque module IA |
| Tarifs | `/pricing` | Plans Solo, Agence, Pro+ avec toggle mensuel/annuel |
| FAQ | `/faq` | Q&A complète sur le produit, sécurité, engagement |
| Contact | `/contact` | Formulaire contact + démo + infos |
| Auth | `/auth` | Connexion / Inscription |

### Fonctionnalités JavaScript

- ✅ **Menu mobile** - Toggle du menu sur mobile
- ✅ **Accordion FAQ** - Click pour déplier/replier les réponses
- ✅ **Formulaires** - Validation email/téléphone, gestion des états
- ✅ **Toggle tarifaire** - Mensuel/Annuel (interface, logique API à implémenter)
- ✅ **Animations au scroll** - Éléments qui apparaissent en scrollant
- ✅ **Smooth scroll** - Ancres HTML qui scrollent avec animation

---

## 🌐 Déploiement

### Déploiement statique (HTML/CSS/JS uniquement)

**Option 1: Netlify** (gratuit, recommandé)
```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy

# 3. Pour déploiement continu depuis Git
# Connectez votre repo GitHub/GitLab dans l'interface Netlify
```

**Option 2: Vercel** (gratuit, optimisé pour Next.js mais fonctionne avec du statique)
```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Deploy
vercel
```

**Option 3: GitHub Pages**
```bash
# 1. Pusher sur GitHub
git push origin main

# 2. Aller dans Settings > Pages
# 3. Sélectionner "Deploy from branch" → main → save
```

### Déploiement avec Node.js/Express

**Option 1: Heroku** (gratuit avec crédit)
```bash
# 1. Installer Heroku CLI
npm install -g heroku

# 2. Se connecter
heroku login

# 3. Créer l'app
heroku create immo-genius

# 4. Deploy
git push heroku main

# 5. Accéder
heroku open
```

**Option 2: Railway** (simple, rapide)
```bash
# 1. Connecter votre repo GitHub
# 2. Railway va détecter Node.js automatiquement
# 3. Deploy en un clic
```

**Option 3: DigitalOcean / Linode / VPS**
```bash
# 1. SSH sur votre serveur
ssh root@your-server-ip

# 2. Cloner le repo
git clone https://github.com/yourusername/immo-genius.git

# 3. Installer dépendances
cd immo-genius && npm install

# 4. Lancer avec PM2 (pour persistance)
npm install -g pm2
pm2 start server.js --name "immo-genius"
pm2 startup
pm2 save

# 5. Configurer Nginx/Apache en reverse proxy
```

---

## 🛠️ Technologies

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Responsive, flexbox, grid, animations
- **JavaScript vanilla** - Pas de frameworks, léger et rapide

### Backend (optionnel)
- **Node.js** - Runtime JavaScript côté serveur
- **Express.js** - Framework web minimaliste
- **CORS** - Gestion des requêtes cross-origin

### Outils
- **npm** - Gestion des dépendances
- **Git** - Contrôle de version

---

## 📡 Documentation API

### Authentification

#### `POST /api/auth/signup`
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "name": "Jean Dupont",
  "email": "jean@immobilier.fr",
  "password": "password123",
  "structure": "independent"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_abc123",
    "email": "jean@immobilier.fr",
    "plan": "free_trial"
  },
  "token": "jwt_token_here"
}
```

#### `POST /api/auth/login`
Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "jean@immobilier.fr",
  "password": "password123"
}
```

---

### Génération de contenu

#### `POST /api/content/generate-listing`
Génère une annonce immobilière.

**Body:**
```json
{
  "propertyDescription": "Appartement 3P, 80m², 2ème étage, vue parc",
  "style": "professional",
  "variant": "long"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "title": "Appartement lumineux 3P...",
    "description": "Superbe appartement...",
    "generatedAt": "2024-06-16T10:30:00Z"
  }
}
```

#### `POST /api/content/generate-social`
Génère des posts réseaux sociaux.

**Body:**
```json
{
  "propertyDescription": "Appartement 3P, 80m², vue parc",
  "platform": "instagram",
  "count": 3
}
```

#### `POST /api/content/generate-message`
Génère un message client.

**Body:**
```json
{
  "clientName": "Marie",
  "context": "follow-up",
  "type": "whatsapp"
}
```

#### `POST /api/estimation/price`
Génère une estimation de prix.

**Body:**
```json
{
  "location": "Paris 8ème",
  "surface": 80,
  "rooms": 3,
  "condition": "good"
}
```

---

## 🗺️ Roadmap

### Version 1.0 (Actuel)
- ✅ Site web complet
- ✅ Pages produit (features, tarifs, FAQ, contact)
- ✅ Authentification (formulaires, validation)
- ✅ Backend mock avec API factices
- ✅ Design responsive et moderne

### Version 1.1
- 🔄 Intégration API IA réelle (OpenAI, Anthropic, etc.)
- 🔄 Dashboard client (mes annonces, historique)
- 🔄 Persistance en base de données (PostgreSQL)
- 🔄 JWT authentification réelle

### Version 1.2
- 🔄 Génération de contenu avancée
- 🔄 Intégrations CRM (Salesforce, HubSpot)
- 🔄 Export / Import multi-portails
- 🔄 Analytics et statistiques

### Version 2.0
- 🔄 Application mobile native (iOS/Android)
- 🔄 Scheduling automatique des posts
- 🔄 Collaboration d'équipe en temps réel
- 🔄 Formation et tutorials vidéo

---

## 📝 Fichiers modifiables

Voici les parties du code à personnaliser pour votre implémentation:

### Textes et contenu
- `index.html` - H1, sous-titre, bénéfices
- `features.html` - Descriptions des fonctionnalités
- `pricing.html` - Plans, prix, durées
- `footer` - Coordonnées, liens

### Styles
- `css/styles.css` - Ligne 7-15 : Variables de couleur
- `css/styles.css` - Ligne 17-20 : Typographies

### Configuration
- `server.js` - Ligne 8 : PORT
- `package.json` - Ligne 1-5 : Metadata du projet

---

## 🔐 Sécurité

⚠️ **Important**: Ce code est une base de démarrage. **Ne le mettez pas en production** sans:

- ✅ Implémenter une vraie authentification JWT
- ✅ Hasher les mots de passe (bcrypt)
- ✅ Utiliser une base de données sécurisée (PostgreSQL, MongoDB)
- ✅ Chiffrer les données sensibles
- ✅ Configurer HTTPS/SSL
- ✅ Implémenter des rate limits
- ✅ Valider et sanitizer tous les inputs
- ✅ Auditer le code pour les vulnérabilités OWASP

---

## 📞 Support

- 📧 Email: contact@immogenius.fr
- 💬 Chat: Disponible dans le compte
- 📱 Téléphone: +33 1 42 34 25 80
- 🌐 Site: https://immogenius.fr

---

## 📄 Licence

MIT License - Libre d'usage pour vos projets.

---

## 👨‍💻 Contributeurs

- **Claude Code** - Création du site web complet

---

## 🎉 Merci!

Merci d'utiliser Immo Genius. Pour toute question ou suggestion, n'hésitez pas à nous contacter!

**Bonne chance avec votre SaaS immobilier ! 🚀**
