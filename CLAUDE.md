# Immo Genius - Notes de développement

## 📌 Vue d'ensemble

Ceci est un SaaS web complet pour agents immobiliers qui génère automatiquement du contenu immobilier (annonces, messages, posts réseaux) grâce à l'IA.

**Stack:** HTML5 + CSS3 + JavaScript vanilla (frontend) + Node.js/Express (backend optionnel)

---

## 🎯 Prochaines étapes (priorité)

### Phase 1: Intégration API IA (URGENT)
- [ ] Remplacer les réponses mock du backend par de vrais appels API IA (OpenAI GPT-4, Anthropic Claude, etc.)
- [ ] Implémenter authentication JWT réelle
- [ ] Connecter une base de données PostgreSQL ou MongoDB
- [ ] Hasher les mots de passe avec bcrypt

### Phase 2: Features utilisateur
- [ ] Dashboard client (mes annonces, historique générations)
- [ ] Éditeur de templates personnalisés
- [ ] Export multi-format (PDF, Word, texte)
- [ ] Gestion d'équipe (pour plan Agence/Pro+)

### Phase 3: Intégrations externes
- [ ] Intégration portails (SeLoger API, LeBonCoin, etc.)
- [ ] Scheduling automatique des posts (Meta Business Suite, Buffer)
- [ ] CRM webhooks (Salesforce, HubSpot, Pipedrive)

---

## 🔧 Améliorations du code

### HTML/CSS
- [ ] Ajouter icones SVG au lieu des emojis (meilleure perf)
- [ ] Pré-charger les webfonts pour meilleure perf
- [ ] Ajouter dark mode (toggle en nav)
- [ ] Améliorer l'accessibilité (ARIA labels)

### JavaScript
- [ ] Remplacer les `alert()` par des modales personnalisées
- [ ] Ajouter une vraie validation côté serveur (ne pas faire confiance au client)
- [ ] Implémenter un rate limiter côté front pour les formulaires
- [ ] Ajouter les analytics (Google Analytics, Mixpanel)

### Backend
- [ ] Ajouter middleware d'authentification réelle
- [ ] Implémenter les routes entièrement (pas juste du mock)
- [ ] Ajouter tests unitaires (Jest, Mocha)
- [ ] Configurer CI/CD (GitHub Actions, GitLab CI)
- [ ] Logger tous les événements importants
- [ ] Ajouter un système de cache (Redis)

---

## 🔐 Checklist Sécurité (IMPORTANT!)

- [ ] HTTPS/SSL activé en production
- [ ] Secrets en variables d'environnement (.env)
- [ ] Validation + sanitization de tous les inputs
- [ ] CORS correctement configuré (pas `'*'`)
- [ ] Helmet middleware pour les headers HTTP
- [ ] Rate limiting sur les endpoints API
- [ ] SQL injection prevention (ORM ou prepared statements)
- [ ] XSS prevention (Content-Security-Policy)
- [ ] Authentification 2FA optionnelle
- [ ] Audit de sécurité externe (OWASP Top 10)

---

## 📊 Structuration de la base de données

Quand vous ajouterez PostgreSQL/MongoDB, prévoir ces tables:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  structure VARCHAR(50), -- 'independent', 'agency', 'network'
  plan VARCHAR(50), -- 'free_trial', 'solo', 'agency', 'pro_plus'
  trial_ends_at TIMESTAMP,
  subscription_start_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated Content
CREATE TABLE generated_content (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50), -- 'listing', 'message', 'social', 'report'
  original_input TEXT,
  generated_output TEXT,
  style VARCHAR(50),
  platform VARCHAR(50), -- pour les posts réseaux
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts / Support Tickets
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  structure VARCHAR(50),
  message TEXT,
  status VARCHAR(50), -- 'new', 'in_progress', 'resolved'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Déploiement

### Développement local
```bash
npm install
npm run dev
```

### Production
```bash
npm start
# Ou avec PM2
pm2 start server.js --name immo-genius
```

### Variables d'environnement (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost/immogenius
JWT_SECRET=your_super_secret_key_here
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://immogenius.fr
```

---

## 📱 Responsive design

Le site est **mobile-first**. Testé sur:
- ✅ iPhone 12/13/14 (375px)
- ✅ iPad (768px)
- ✅ Desktop (1200px+)

Toujours tester les changements sur mobile!

---

## 🧪 Testing

À ajouter:
```bash
npm install --save-dev jest supertest
npm test
```

### Test API exemple:
```javascript
describe('POST /api/auth/login', () => {
  it('should return user and token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
```

---

## 📈 Analytics à intégrer

- Google Analytics (pour les pages du site)
- Segment ou Mixpanel (pour le product usage)
- Sentry (pour les erreurs)
- LogRocket (pour les session replays)

---

## 💰 Monetization

Tarification actuelle:
- **Solo**: 39€/mois → ~1800€/an par client
- **Agence**: 99€/mois → ~1200€/an par client
- **Pro+**: Sur devis

Objectif: 1000 clients plan Solo + 100 clients Agence = ~220k€ MRR

---

## 🎨 Branding

Les couleurs/fonts sont dans `css/styles.css`:
- Primary: #1A3A52 (bleu nuit)
- Secondary: #22C55E (vert)
- Accent: #D4AF37 (or)

Changer facilement en modifiant les CSS variables.

---

## 📝 Checklist avant mise en ligne

- [ ] Lancer un audit Lighthouse (>90 partout)
- [ ] Tester sur tous les navigateurs majeurs
- [ ] Vérifier les temps de chargement
- [ ] Valider WCAG 2.1 AA (accessibilité)
- [ ] Tester tous les formulaires
- [ ] Vérifier les liens (pas de 404)
- [ ] Configurer le SSL/HTTPS
- [ ] Ajouter robots.txt et sitemap.xml
- [ ] Configurer Google Search Console
- [ ] Configurer les emails transactionnels
- [ ] Mettre en place les logs et monitoring

---

## 🆘 Help & Feedback

Si tu as besoin d'aide sur:
- **Architecture**: Contacte un tech lead
- **Design**: Améliore avec Figma d'abord
- **Performance**: Utilise Lighthouse & WebPageTest
- **Sécurité**: OWASP Top 10 + audit externe

---

## 🔗 Ressources utiles

- [Express.js Docs](https://expressjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12 Factor App](https://12factor.net/)
- [Google Web Vitals](https://web.dev/vitals/)

---

**Good luck! Build something amazing! 🚀**
