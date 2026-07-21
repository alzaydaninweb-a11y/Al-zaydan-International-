/**
 * netlify/functions/add-product-to-sheet.js
 *
 * Serverless function to append a new product row to the client's Google Sheet.
 * Authenticates with Google Sheets API using Service Account private keys.
 *
 * Expected payload (JSON):
 * {
 *   "id": "firestore_doc_id",
 *   "name": "Product Name",
 *   "brand": "Brand",
 *   "category": "Category",
 *   "price": 100,
 *   "priceType": "fixed",
 *   "inStock": true,
 *   "featured": false,
 *   "slug": "product-slug"
 * }
 */

import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Verify Firebase Admin Authentication ────────────────────────────────────
const verifyAuth = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid authorization token.');
  }

  const idToken = authHeader.split(' ')[1];
  const apiKey = process.env.VITE_FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error('Server configuration error: Firebase API Key is missing.');
  }

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
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

// ─── Generate Google Sheets OAuth2 Access Token ──────────────────────────────
function base64url(strOrBuffer) {
  const buf = Buffer.isBuffer(strOrBuffer) ? strOrBuffer : Buffer.from(strOrBuffer);
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getGoogleAccessToken(email, privateKey) {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claim = base64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const signatureInput = `${header}.${claim}`;
  // Ensure literal newlines in private key are parsed correctly
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = base64url(sign.sign(formattedKey));

  const jwt = `${signatureInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const errorDetails = await tokenRes.text();
    throw new Error(`Failed to get Google Access Token: ${errorDetails}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

// ─── Sanitize Sheet Name (limit to 31 chars, strip forbidden chars) ──────────
const sanitizeSheetName = (name) => {
  let cleanName = name.replace(/[\\\/\?\*\:\[\]]/g, '');
  if (!cleanName) {
    cleanName = 'General';
  }
  return cleanName.substring(0, 31);
};

// ─── Handler ─────────────────────────────────────────────────────────────────
export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 1. Verify Requesting Admin Authenticated
    await verifyAuth(event);

    // 2. Parse Payload
    const payload = JSON.parse(event.body);
    const { id, name, brand, category, price, priceType, inStock, featured, slug, moq, badge, trustBadges } = payload;

    if (!id || !name || !category) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Bad Request: Missing product ID, Name, or Category.' }),
      };
    }

    // 3. Get Credentials
    const googleEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!googleEmail || !googlePrivateKey || !spreadsheetId) {
      console.error('Google Service Account credentials or Spreadsheet ID are not configured.');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server configuration error: Google credentials missing.' }),
      };
    }

    // 4. Retrieve Access Token
    console.log('Generating Google OAuth2 Access Token...');
    const accessToken = await getGoogleAccessToken(googleEmail, googlePrivateKey);

    // 5. Append Row to Sheet Tab
    const targetSheetName = sanitizeSheetName(category);
    const productUrl = slug ? `https://www.alzaydaninternational.com/product/${slug}` : '';

    let priceColVal = 0;
    let mrpColVal = 0;

    if (priceType === 'range') {
      priceColVal = payload.priceMin || 0;
      mrpColVal = payload.priceMax || 0;
    } else if (priceType === 'fixed') {
      priceColVal = price || 0;
      mrpColVal = payload.mrp || 0;
    }

    const trustBadgesStr = Array.isArray(trustBadges) ? trustBadges.join(', ') : String(trustBadges || '');
    const newRow = [
      id,
      name,
      brand || '',
      category,
      priceColVal,
      priceType || 'fixed',
      inStock ? 'In Stock' : 'Out of Stock',
      featured ? 'Yes' : 'No',
      productUrl,
      moq || '',
      badge || 'None',
      trustBadgesStr,
      mrpColVal,
    ];

    const range = `${targetSheetName}!A:M`;
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    console.log(`Attempting to append row to tab "${targetSheetName}"...`);
    let appendRes = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ values: [newRow] }),
    });

    // 6. If tab does not exist (HTTP 400 error), create the tab, write headers, and write row
    if (!appendRes.ok && appendRes.status === 400) {
      const errorData = await appendRes.json();
      const message = errorData.error?.message || '';

      if (message.includes('Unable to parse range') || message.includes('not found')) {
        console.log(`Tab "${targetSheetName}" not found. Creating new tab...`);

        // Create the sheet/tab
        const createSheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
        const createRes = await fetch(createSheetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: {
                    title: targetSheetName,
                  },
                },
              },
            ],
          }),
        });

        if (!createRes.ok) {
          const createError = await createRes.text();
          console.error('Failed to create sheet tab:', createError);
          throw new Error(`Failed to create Google Sheet tab: ${createRes.statusText}`);
        }

        // Write Headers and Product Row in a single call
        const headers = [
          'Product Code',
          'Name',
          'Brand',
          'Category',
          'Price / Min Price (AED)',
          'Price Type',
          'Stock Status',
          'Featured',
          'Product Page Link',
          'MOQ',
          'Product Badge',
          'Trust Badges',
          'MRP / Max Price (AED)',
        ];

        const headerRange = `${targetSheetName}!A1:M2`;
        const updateHeadersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}?valueInputOption=USER_ENTERED`;
        const writeRes = await fetch(updateHeadersUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            values: [headers, newRow],
          }),
        });

        if (!writeRes.ok) {
          const writeError = await writeRes.text();
          console.error('Failed to write headers and row to new tab:', writeError);
          throw new Error('Failed to write product data to new sheet tab.');
        }

        console.log(`Created tab "${targetSheetName}" and appended product successfully.`);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ success: true, message: `Created sheet tab "${targetSheetName}" and synced product successfully.` }),
        };
      }
    }

    if (!appendRes.ok) {
      const appendError = await appendRes.text();
      console.error('Sheets API append failed:', appendError);
      return {
        statusCode: appendRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Google Sheets sync failed: ${appendRes.statusText}` }),
      };
    }

    console.log(`Product ${id} successfully appended to Google Sheet.`);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: `Product synced to Google Sheet successfully.` }),
    };

  } catch (err) {
    console.error('Add product to sheet caught error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' }),
    };
  }
};
