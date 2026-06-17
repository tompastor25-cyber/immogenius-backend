# 🔐 Configuration OAuth - Google & Microsoft

Guide complet pour intégrer l'authentification Google et Microsoft dans Immo Genius.

---

## 📋 Vue d'ensemble

Les boutons "Continuer avec Google" et "Continuer avec Microsoft" fonctionnent mais nécessitent une configuration OAuth pour être productifs.

**État actuel:**
- ✅ Boutons visibles et cliquables
- ✅ Logique JavaScript prête
- ✅ Page callback en place
- ❌ Clés OAuth manquantes (développement)

**Temps d'installation:** ~15 minutes par fournisseur

---

## 🔵 Configuration Google OAuth 2.0

### Étape 1: Créer un projet Google Cloud

1. Aller à [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquer sur "Créer un projet"
3. Entrer un nom: `immo-genius` (ou votre domaine)
4. Cliquer "Créer"
5. Attendre ~1 minute que le projet soit créé

### Étape 2: Activer l'API Google+

1. Dans la console, aller à **API et services** → **Bibliothèque**
2. Chercher "Google+ API"
3. Cliquer dessus et appuyer sur **Activer**
4. Attendre quelques secondes

### Étape 3: Créer les identifiants OAuth

1. Aller à **API et services** → **Identifiants**
2. Cliquer sur **+ Créer des identifiants** → **ID client OAuth**
3. Si popup "Écran de consentement OAuth": 
   - Cliquer sur **Configurer l'écran de consentement**
   - Type d'utilisateur: **Externe** → Créer
   - Remplir les champs obligatoires:
     - **Nom de l'application:** Immo Genius
     - **Email de support utilisateur:** votre@email.com
     - **Coordonnées du développeur:** votre@email.com
   - Cliquer "Enregistrer et continuer"
   - Scopes: Ajouter `openid`, `email`, `profile`
   - Cliquer "Enregistrer et continuer"

4. **Créer l'ID client:**
   - Type d'application: **Application Web**
   - Nom: `Immo Genius Web`
   - **URIs JavaScript autorisés:**
     - `http://localhost:3000`
     - `https://votre-domaine.com`
   - **URIs de redirection autorisés:**
     - `http://localhost:3000/auth-callback?provider=google`
     - `https://votre-domaine.com/auth-callback?provider=google`
   - Cliquer "Créer"

5. **Copier votre CLIENT_ID**
   - Une popup affiche votre ID client
   - Copier l'ID (commence par `...apps.googleusercontent.com`)

### Étape 4: Intégrer le CLIENT_ID

Ouvrir `js/script.js` et remplacer:

```javascript
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
```

Par votre vrai ID:

```javascript
const GOOGLE_CLIENT_ID = '123456789-abc.apps.googleusercontent.com';
```

✅ Google OAuth est prêt!

---

## 🏢 Configuration Microsoft OAuth 2.0

### Étape 1: Enregistrer l'application sur Azure

1. Aller à [Azure Portal](https://portal.azure.com/)
2. Chercher **Enregistrements d'applications**
3. Cliquer **+ Nouvel enregistrement**
4. Remplir les champs:
   - **Nom:** Immo Genius
   - **Types de comptes pris en charge:** Comptes dans n'importe quel annuaire d'organisation et comptes Microsoft personnels
   - **URI de redirection:** Web - `http://localhost:3000/auth-callback?provider=microsoft`
5. Cliquer **Enregistrer**

### Étape 2: Configurer les URI de redirection

1. Dans votre app enregistrée, aller à **Authentification**
2. Sous **URI de redirection**, ajouter:
   - `http://localhost:3000/auth-callback?provider=microsoft` (développement)
   - `https://votre-domaine.com/auth-callback?provider=microsoft` (production)
3. Cocher **Accorder un consentement administrateur**
4. Cliquer **Enregistrer**

### Étape 3: Créer un secret client

1. Aller à **Certificats et secrets**
2. Cliquer **+ Nouveau secret client**
3. Description: `Immo Genius Web Secret`
4. Expiration: **24 mois**
5. Cliquer **Ajouter**
6. **COPIER IMMÉDIATEMENT** la valeur du secret (elle disparaîtra!)

### Étape 4: Récupérer l'ID client

1. Aller à **Vue d'ensemble**
2. Copier **ID d'application (client)** - commence par 8-4-4-4-12 caractères

### Étape 5: Intégrer le CLIENT_ID

Ouvrir `js/script.js` et remplacer:

```javascript
const MICROSOFT_CLIENT_ID = 'YOUR_MICROSOFT_CLIENT_ID_HERE';
```

Par votre vrai ID:

```javascript
const MICROSOFT_CLIENT_ID = '12345678-1234-1234-1234-123456789012';
```

✅ Microsoft OAuth est prêt!

---

## 🔗 Intégration Backend (Production)

Actuellement, le callback est simulé. En production, vous devez:

### 1. Créer une route backend `/api/auth/oauth/callback`

```javascript
// server.js
app.post('/api/auth/oauth/callback', async (req, res) => {
  const { code, provider } = req.body;

  try {
    // Échangez le code contre un token
    const token = await exchangeOAuthCode(code, provider);
    
    // Récupérez les données utilisateur
    const userData = await getUserDataFromToken(token, provider);
    
    // Créez ou trouvez l'utilisateur en BD
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({
        email: userData.email,
        name: userData.name,
        provider: provider,
        avatar: userData.picture
      });
    }

    // Générez un JWT
    const jwtToken = generateJWT(user);

    return res.json({
      success: true,
      user: user,
      token: jwtToken
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
});
```

### 2. Implémenter les fonctions d'échange de token

```javascript
/**
 * Échange un code d'autorisation contre un token OAuth
 */
async function exchangeOAuthCode(code, provider) {
  if (provider === 'google') {
    return exchangeGoogleCode(code);
  } else if (provider === 'microsoft') {
    return exchangeMicrosoftCode(code);
  }
}

/**
 * Google: Échange du code
 */
async function exchangeGoogleCode(code) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });

  const data = await response.json();
  if (!data.access_token) throw new Error('Invalid code');
  return data.access_token;
}

/**
 * Microsoft: Échange du code
 */
async function exchangeMicrosoftCode(code) {
  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
      grant_type: 'authorization_code'
    })
  });

  const data = await response.json();
  if (!data.access_token) throw new Error('Invalid code');
  return data.access_token;
}

/**
 * Récupère les données utilisateur depuis le token OAuth
 */
async function getUserDataFromToken(token, provider) {
  if (provider === 'google') {
    return getGoogleUserData(token);
  } else if (provider === 'microsoft') {
    return getMicrosoftUserData(token);
  }
}

async function getGoogleUserData(token) {
  const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}

async function getMicrosoftUserData(token) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

### 3. Configurer les variables d'environnement

Créer `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://votre-domaine.com/auth-callback?provider=google

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_client_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_here
MICROSOFT_REDIRECT_URI=https://votre-domaine.com/auth-callback?provider=microsoft

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Modifier auth-callback.html

Remplacer la simulation par un appel API réel:

```javascript
function exchangeCodeForToken(code, provider) {
  // Appel API réel
  fetch('/api/auth/oauth/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, provider })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Sauvegarder le token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Rediriger
      window.location.href = '/dashboard';
    } else {
      handleAuthError(data.message);
    }
  })
  .catch(err => handleAuthError(err.message));
}
```

---

## 🧪 Test en développement

### Avec les clés configurées:

1. Cliquer sur "Continuer avec Google" ou "Continuer avec Microsoft"
2. Vous êtes redirigé vers le formulaire de connexion du fournisseur
3. Après authentification, vous êtes redirigé vers `/auth-callback`
4. La page affiche "Authentification en cours..."
5. Après 2 secondes, vous êtes redirigé vers la page d'accueil

### Troubleshooting:

| Problème | Solution |
|----------|----------|
| "Erreur lors du chargement de la page" | Vérifier que l'URI de redirection est enregistrée exactement |
| "Invalid client" | Copier le CLIENT_ID sans espaces |
| Page blanche après redirection | Vérifier les logs du navigateur (F12 → Console) |
| Boutons affichent "pas configuré" | Vous n'avez pas mis à jour le CLIENT_ID dans script.js |

---

## 🔒 Sécurité (Important!)

- ✅ Ne jamais commit les CLIENT_SECRET en git
- ✅ Toujours utiliser `.env` pour les secrets
- ✅ En production: HTTPS obligatoire
- ✅ Vérifier le `state` parameter pour éviter CSRF
- ✅ Hasher les mots de passe même avec OAuth

### Ajout du state parameter (recommandé):

```javascript
// Générer un state aléatoire
const state = Math.random().toString(36).substring(7);
sessionStorage.setItem('oauthState', state);

// Ajouter à l'URL
const authUrl = `...&state=${encodeURIComponent(state)}`;

// Vérifier au callback
const returnedState = new URLSearchParams(location.search).get('state');
if (returnedState !== sessionStorage.getItem('oauthState')) {
  handleAuthError('CSRF attack detected!');
}
```

---

## 📚 Ressources utiles

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft OAuth 2.0 Docs](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [RFC 6749 - OAuth 2.0 Authorization](https://tools.ietf.org/html/rfc6749)
- [OWASP: OAuth 2.0 Security](https://cheatsheetseries.owasp.org/cheatsheets/OAuth_2_Cheat_Sheet.html)

---

## ✅ Checklist avant production

- [ ] Google CLIENT_ID configuré
- [ ] Microsoft CLIENT_ID configuré
- [ ] Backend route `/api/auth/oauth/callback` implémentée
- [ ] Échange de code pour token en place
- [ ] Récupération données utilisateur en place
- [ ] Variables d'environnement sauvegardées
- [ ] State parameter implémenté
- [ ] HTTPS activé
- [ ] Tous les URI de redirection enregistrés
- [ ] Tests OAuth réalisés
- [ ] Logs d'erreurs en place
- [ ] Tests de sécurité OWASP faits

---

Good luck! 🚀 Vous êtes prêt à l'authentification OAuth!
