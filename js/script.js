/* ============================================
   IMMO GENIUS - JavaScript
   Fonctionnalités interactives du SaaS
   ============================================ */

// ============================================
// MENU MOBILE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });

    // Fermer le menu quand on clique sur un lien
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
      });
    });
  }
});

// ============================================
// TOGGLE TARIFICATION (MENSUEL / ANNUEL)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  const monthlyBtn = document.querySelector('[data-toggle="monthly"]');
  const yearlyBtn = document.querySelector('[data-toggle="yearly"]');

  if (monthlyBtn && yearlyBtn) {
    monthlyBtn.addEventListener('click', function() {
      monthlyBtn.classList.add('active');
      yearlyBtn.classList.remove('active');
      updatePrices('monthly');
    });

    yearlyBtn.addEventListener('click', function() {
      yearlyBtn.classList.add('active');
      monthlyBtn.classList.remove('active');
      updatePrices('yearly');
    });
  }
});

/**
 * Met à jour les prix en fonction du toggle (mensuel/annuel)
 * Note: Cette fonction est basique. En production, intégrer une vraie API.
 */
function updatePrices(period) {
  const soloPrice = document.querySelector('[data-plan="solo"] .price');
  const agencyPrice = document.querySelector('[data-plan="agency"] .price');

  if (period === 'yearly') {
    // Réduction de 15% pour l'annuel
    soloPrice.innerHTML = '39€<span>/mois</span>';
    agencyPrice.innerHTML = '99€<span>/mois</span>';
    console.log('Annuel sélectionné - appliquer réduction API');
  } else {
    soloPrice.innerHTML = '39€<span>/mois</span>';
    agencyPrice.innerHTML = '99€<span>/mois</span>';
  }
}

// ============================================
// ACCORDION (FAQ)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const item = this.closest('.accordion-item');
      const isActive = item.classList.contains('active');

      // Fermer tous les autres accordions
      document.querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('active');
      });

      // Ouvrir/fermer l'actuel
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
});

// ============================================
// FORMULAIRES - VALIDATION & SOUMISSION
// ============================================

/**
 * Valide un email basique
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valide un numéro de téléphone français (optionnel)
 */
function validatePhone(phone) {
  if (!phone) return true; // Optionnel
  const re = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
  return re.test(phone.replace(/\s/g, ''));
}

/**
 * Gère la soumission du formulaire de contact
 */
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('#contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Récupérer les valeurs
      const name = document.querySelector('#name').value.trim();
      const email = document.querySelector('#email').value.trim();
      const phone = document.querySelector('#phone').value.trim();
      const structure = document.querySelector('#structure').value;
      const message = document.querySelector('#message').value.trim();
      const successMsg = document.querySelector('#form-success');

      // Validation
      let isValid = true;
      let errors = [];

      if (!name) {
        isValid = false;
        errors.push('Nom requis');
      }

      if (!email || !validateEmail(email)) {
        isValid = false;
        errors.push('Email invalide');
      }

      if (!validatePhone(phone) && phone) {
        isValid = false;
        errors.push('Téléphone invalide');
      }

      if (!message) {
        isValid = false;
        errors.push('Message requis');
      }

      if (!isValid) {
        alert('Erreurs:\n' + errors.join('\n'));
        return;
      }

      // Simulation d'envoi (en production, appeler une vraie API)
      console.log('Formulaire valide - données à envoyer:', {
        name, email, phone, structure, message
      });

      // Afficher message de succès
      successMsg.classList.add('show');
      contactForm.reset();

      // Masquer le message après 5 secondes
      setTimeout(() => {
        successMsg.classList.remove('show');
      }, 5000);
    });
  }
});

/**
 * Gère la soumission du formulaire d'authentification (login/signup)
 */
document.addEventListener('DOMContentLoaded', function() {
  const authForm = document.querySelector('#authForm');
  const toggleAuthBtn = document.querySelector('#toggleAuth');
  const authTitle = document.querySelector('#authTitle');
  const passwordConfirmGroup = document.querySelector('#passwordConfirmGroup');
  const nameGroup = document.querySelector('#nameGroup');
  const submitBtn = document.querySelector('#submitAuth');

  if (authForm && toggleAuthBtn) {
    let isSignup = false;

    toggleAuthBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isSignup = !isSignup;

      if (isSignup) {
        authTitle.textContent = 'Créer un compte';
        submitBtn.textContent = 'S\'inscrire';
        toggleAuthBtn.textContent = 'Vous avez déjà un compte ? Se connecter';
        passwordConfirmGroup.style.display = 'block';
        nameGroup.style.display = 'block';
      } else {
        authTitle.textContent = 'Se connecter';
        submitBtn.textContent = 'Se connecter';
        toggleAuthBtn.textContent = 'Pas encore de compte ? S\'inscrire';
        passwordConfirmGroup.style.display = 'none';
        nameGroup.style.display = 'none';
      }
    });

    authForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const email = document.querySelector('#authEmail').value.trim();
      const password = document.querySelector('#authPassword').value.trim();
      const passwordConfirm = document.querySelector('#authPasswordConfirm')?.value.trim();
      const name = document.querySelector('#authName')?.value.trim();

      // Validation basique
      if (!email || !validateEmail(email)) {
        alert('Email invalide');
        return;
      }

      if (!password || password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      if (isSignup) {
        if (!name) {
          alert('Nom requis');
          return;
        }

        if (password !== passwordConfirm) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }

        console.log('Inscription:', { name, email, password });
        alert('Inscription simulée. En production, appeler une vraie API.');
      } else {
        console.log('Connexion:', { email, password });
        alert('Connexion simulée. En production, appeler une vraie API.');
        // Rediriger vers le dashboard après connexion
        // window.location.href = '/dashboard.html';
      }
    });
  }

  // Boutons OAuth - Google et Microsoft
  setupOAuthButtons();
});

/**
 * Configure les boutons OAuth (Google et Microsoft)
 * En production, intégrer les vraies clés OAuth2
 */
function setupOAuthButtons() {
  const googleBtn = document.querySelector('#googleBtn');
  const microsoftBtn = document.querySelector('#microsoftBtn');

  if (googleBtn) {
    googleBtn.addEventListener('click', function() {
      handleGoogleAuth();
    });
  }

  if (microsoftBtn) {
    microsoftBtn.addEventListener('click', function() {
      handleMicrosoftAuth();
    });
  }
}

/**
 * Gère l'authentification Google
 * À remplacer par la vraie intégration Google OAuth 2.0
 */
function handleGoogleAuth() {
  console.log('[AUTH] Tentative connexion Google...');

  // Configuration Google OAuth (à remplir avec vos vraies clés)
  const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';
  const GOOGLE_REDIRECT_URI = window.location.origin + '/auth-callback?provider=google';

  // Pour le développement: simulation
  if (GOOGLE_CLIENT_ID.includes('YOUR_')) {
    alert('⚠️ Google OAuth non configuré en développement.\n\nPour l\'activer:\n1. Créer un projet Google Cloud\n2. Configurer les credentials OAuth 2.0\n3. Copier le CLIENT_ID ici\n\nPour tester: créez un compte avec email/mot de passe.');
    return;
  }

  // URL Google OAuth
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline'
  })}`;

  window.location.href = googleAuthUrl;
}

/**
 * Gère l'authentification Microsoft
 * À remplacer par la vraie intégration Microsoft OAuth 2.0
 */
function handleMicrosoftAuth() {
  console.log('[AUTH] Tentative connexion Microsoft...');

  // Configuration Microsoft OAuth (à remplir avec vos vraies clés)
  const MICROSOFT_CLIENT_ID = 'YOUR_MICROSOFT_CLIENT_ID_HERE';
  const MICROSOFT_REDIRECT_URI = window.location.origin + '/auth-callback?provider=microsoft';

  // Pour le développement: simulation
  if (MICROSOFT_CLIENT_ID.includes('YOUR_')) {
    alert('⚠️ Microsoft OAuth non configuré en développement.\n\nPour l\'activer:\n1. Enregistrer l\'application sur Azure Portal\n2. Configurer les credentials OAuth 2.0\n3. Copier le CLIENT_ID ici\n\nPour tester: créez un compte avec email/mot de passe.');
    return;
  }

  // URL Microsoft OAuth
  const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    redirect_uri: MICROSOFT_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    response_mode: 'query'
  })}`;

  window.location.href = microsoftAuthUrl;
}

// ============================================
// SMOOTH SCROLL (pour les ancres)
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// ANIMATIONS AU SCROLL (optionnel)
// ============================================

/**
 * Ajoute une animation à un élément quand il devient visible
 */
function observeElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });

  // Observer tous les cards et sections
  document.querySelectorAll('.card, .feature-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', observeElements);

// ============================================
// UTILITAIRES
// ============================================

/**
 * Log simple pour debug
 */
window.IG = {
  log: function(msg) {
    console.log('[ImmoGenius] ' + msg);
  },
  version: '1.0.0'
};
