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

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
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
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(parsedJson)
    };

  } catch (err) {
    console.error('[generate-product-content] Error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to generate product content.',
        details: err.message
      })
    };
  }
};
