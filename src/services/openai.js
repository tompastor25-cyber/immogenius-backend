// Service OpenAI pour la génération de contenu IA

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Génère une annonce immobilière
 */
export async function generateListing(propertyData, style = 'professional') {
  const prompt = `Tu es un expert en rédaction d'annonces immobilières.
Crée une annonce professionnelle pour ce bien:

Adresse: ${propertyData.address}
Surface: ${propertyData.surface}m²
Pièces: ${propertyData.rooms}
Type: ${propertyData.type}
État: ${propertyData.condition}
Points forts: ${propertyData.highlights?.join(', ') || 'Aucun'}
Description: ${propertyData.description || ''}

Génère 3 variantes:
1. Titre accrocheur (max 100 chars)
2. Description longue (500-800 words, optimisée SEO)
3. Description courte (150-200 words)

Format JSON:
{
  "title": "...",
  "longDescription": "...",
  "shortDescription": "..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en immobilier et en rédaction. Réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      content: content,
      tokens: response.usage.total_tokens,
      cost: (response.usage.total_tokens / 1000) * 0.002  // GPT-3.5-turbo pricing
    };
  } catch (error) {
    console.error('[OpenAI] Error generating listing:', error);
    throw error;
  }
}

/**
 * Génère des messages clients
 */
export async function generateClientMessage(clientData, context = 'follow-up') {
  const contextPrompts = {
    follow_up: 'Une relance amicale pour un prospect intéressé',
    new_contact: 'Un premier message de contact',
    closing: 'Un message pour conclure une vente',
    objection: 'Une réponse à une objection'
  };

  const prompt = `Tu es un agent immobilier professionnel et persuasif.
Génère des messages clients pour: ${contextPrompts[context] || contextPrompts.follow_up}

Client: ${clientData.name || 'Client'}
Bien: ${clientData.property || 'Un bien'}
Contexte: ${clientData.context || ''}

Génère 3 variantes de messages professionnels et amicaux:
1. WhatsApp (court, 150 chars max)
2. Email (formel, 300 chars max)
3. SMS (très court, 100 chars max)

Réponds en JSON valide.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un agent immobilier expert en communication. Réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const messages = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      messages: messages,
      tokens: response.usage.total_tokens,
      cost: (response.usage.total_tokens / 1000) * 0.002
    };
  } catch (error) {
    console.error('[OpenAI] Error generating message:', error);
    throw error;
  }
}

/**
 * Génère des posts réseaux sociaux
 */
export async function generateSocialPost(propertyData, platform = 'instagram') {
  const platformGuides = {
    instagram: 'Post avec emojis, hashtags, structure avec breaks. Max 2000 chars.',
    facebook: 'Post informatif, professionnel, CTA clair. Moins d\'emojis.',
    linkedin: 'Contenu professionnel, insights marché immobilier, storytelling.'
  };

  const prompt = `Tu es un expert en social media pour l'immobilier.
Génère des posts ${platform} optimisés: ${platformGuides[platform]}

Bien: ${propertyData.address}
Type: ${propertyData.type}
Points clés: ${propertyData.highlights?.join(', ') || ''}

Génère 3 variantes avec:
- Texte principal
- Hashtags pertinents (5-10)
- Emojis (si approprié)

Réponds en JSON valide.`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert social media. Réponds toujours en JSON valide avec clés: text, hashtags, emojis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const posts = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      posts: posts,
      platform: platform,
      tokens: response.usage.total_tokens,
      cost: (response.usage.total_tokens / 1000) * 0.002
    };
  } catch (error) {
    console.error('[OpenAI] Error generating social post:', error);
    throw error;
  }
}

/**
 * Génère une estimation de prix
 */
export async function generatePriceEstimation(propertyData) {
  const prompt = `Tu es un expert en évaluation immobilière.
Fournis une estimation de prix pour ce bien:

Localisation: ${propertyData.location}
Surface: ${propertyData.surface}m²
Pièces: ${propertyData.rooms}
Type: ${propertyData.type}
État: ${propertyData.condition}
Année: ${propertyData.year || 'Inconnue'}

Fournis:
1. Prix minimum estimé (EUR)
2. Prix maximum estimé (EUR)
3. Prix par m² moyen
4. Justification détaillée
5. Facteurs positifs/négatifs

Réponds en JSON valide avec clés: minPrice, maxPrice, pricePerSqm, justification, positiveFactors, negativeFactors`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert immobilier en évaluation de prix. Réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,  // Moins de température pour la précision
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const estimation = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      estimation: estimation,
      tokens: response.usage.total_tokens,
      cost: (response.usage.total_tokens / 1000) * 0.002,
      disclaimer: 'Cette estimation IA n\'est pas une expertise officielle. À faire valider par un expert.'
    };
  } catch (error) {
    console.error('[OpenAI] Error generating estimation:', error);
    throw error;
  }
}

/**
 * Génère une réponse aux avis Google
 */
export async function generateReviewResponse(reviewData) {
  const toneGuides = {
    positive: 'Remerciement chaleureux, invitation à revenir',
    negative: 'Désamorçage professionnel, proposition de solution',
    neutral: 'Réponse équilibrée, amélioration constructive'
  };

  const prompt = `Tu es un gestionnaire de réputation pour une agence immobilière.
Génère une réponse professionnelle à cet avis ${reviewData.rating}-étoiles:

Avis: "${reviewData.text}"
Auteur: ${reviewData.author}
Ton: ${toneGuides[reviewData.tone] || toneGuides.neutral}

Critères:
- Professionnel et poli
- Max 500 chars
- Inviter à continuer la conversation en privé si négatif
- Spécifique au contenu de l'avis

Réponds en JSON valide avec clé: response`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en gestion de réputation. Réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const reply = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      response: reply.response,
      tokens: response.usage.total_tokens,
      cost: (response.usage.total_tokens / 1000) * 0.002
    };
  } catch (error) {
    console.error('[OpenAI] Error generating review response:', error);
    throw error;
  }
}
