/**
 * netlify/functions/generate-product-content.js
 *
 * Calls the Google Gemini API to automatically generate semantic product content,
 * including SEO descriptions, FAQs, specifications, and keywords.
 *
 * This function expects a JSON payload:
 * {
 *   "name": "Product Name",
 *   "brand": "Brand",
 *   "category": "Category",
 *   "description": "Optional existing short description to expand on."
 * }
 */

const getAllowedOrigin = (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  if (!origin) return 'https://www.alzaydaninternational.com';

  const allowedOrigins = [
    'https://www.alzaydaninternational.com',
    'https://alzaydaninternational.com',
    'http://localhost:3000',
    'http://localhost:8888'
  ];

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  if (/^https:\/\/.*--alzaydaninternational\.netlify\.app$/i.test(origin) ||
      /^https:\/\/.*--alzaydan\.netlify\.app$/i.test(origin)) {
    return origin;
  }

  return 'https://www.alzaydaninternational.com';
};

const verifyAuth = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid authorization token.');
  }

  const idToken = authHeader.split(' ')[1];
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error('Server configuration error: Firebase API Key is missing.');
  }

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  if (!res.ok) {
    throw new Error('Unauthorized: Invalid or expired token.');
  }

  const data = await res.json();
  if (!data.users || data.users.length === 0) {
    throw new Error('Unauthorized: User not found.');
  }

  return data.users[0];
};

export const handler = async (event) => {
  const origin = getAllowedOrigin(event);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  try {
    await verifyAuth(event);
  } catch (authError) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({ error: authError.message })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server misconfiguration: GEMINI_API_KEY is missing.' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { name, brand, category, description } = payload;

    if (!name || !category) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Product name and category are required.' })
      };
    }

    // Strict JSON Schema prompt
    const prompt = `You are a World-Class Ecommerce Content SEO Strategist and Technical Product Copywriter.
Generate highly optimized, unique B2B product content for the UAE market.
Target length: 300-800 words total. Do not use generic filler. Be specific.

Product Details:
- Name: ${name}
- Brand: ${brand || 'Al Zaydan International'}
- Category: ${category}
- Context/Notes: ${description || 'Generate comprehensive B2B industrial supply details.'}

Return a raw JSON object (without markdown code blocks or formatting) matching this exact schema:
{
  "description": "A comprehensive 2-3 paragraph B2B product overview.",
  "features": ["Bullet point feature 1", "Bullet point feature 2", ...],
  "benefits": ["Benefit 1", "Benefit 2", ...],
  "applications": ["Construction", "Warehousing", ...],
  "specifications": [
    { "key": "Material", "value": "..." },
    { "key": "Color", "value": "..." },
    { "key": "Origin", "value": "..." }
  ],
  "faqs": [
    { "question": "Product specific question 1?", "answer": "Answer..." },
    { "question": "Product specific question 2?", "answer": "Answer..." }
  ],
  "primaryKeyword": "...",
  "secondaryKeywords": ["...", "..."],
  "semanticEntities": ["...", "..."]
}
Ensure the JSON is valid and can be parsed by JSON.parse(). Provide exactly 5-10 FAQs.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error('Gemini API returned empty content');
    }

    const parsedJson = JSON.parse(rawContent);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify(parsedJson)
    };

  } catch (err) {
    console.error('[generate-product-content] Error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({
        error: 'Failed to generate product content.',
        details: err.message
      })
    };
  }
};
