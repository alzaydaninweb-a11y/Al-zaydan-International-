/**
 * netlify/functions/sync-sheet-product.js
 *
 * Secure serverless endpoint to sync product price, stock status, brand,
 * featured status, and price type from a Google Sheet to Firestore.
 *
 * Expected payload (JSON):
 * {
 *   "id": "product_doc_id",
 *   "price": 120,
 *   "brand": "3M",
 *   "inStock": true,
 *   "featured": false,
 *   "priceType": "fixed"
 * }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler = async (event, context) => {
  // Handle CORS Preflight OPTIONS request
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
    // 1. Verify Secret Token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const secretToken = process.env.SYNC_SECRET_TOKEN;

    if (!secretToken) {
      console.error('SYNC_SECRET_TOKEN is not configured in Netlify environment variables.');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server configuration error: SYNC_SECRET_TOKEN missing.' }),
      };
    }

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== secretToken) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized: Invalid or missing sync token.' }),
      };
    }

    // 2. Parse and Validate Payload
    const payload = JSON.parse(event.body);
    const { id } = payload;

    if (!id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Bad Request: Missing product ID.' }),
      };
    }

    // 3. Authenticate with Firebase via Auth REST API (using Admin login credentials)
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'al-zaydan-international';
    const adminEmail = process.env.SYNC_ADMIN_EMAIL;
    const adminPassword = process.env.SYNC_ADMIN_PASSWORD;

    if (!apiKey || !adminEmail || !adminPassword) {
      console.error('Missing Firebase configuration or Admin credentials.');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server configuration error: Firebase credentials missing.' }),
      };
    }

    console.log('Authenticating sync service user...');
    const authRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
        returnSecureToken: true,
      }),
    });

    if (!authRes.ok) {
      const authError = await authRes.text();
      console.error('Firebase Auth sign-in failed:', authError);
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Firebase Auth authentication failed.' }),
      };
    }

    const authData = await authRes.json();
    const idToken = authData.idToken;

    // 4. Construct Firestore PATCH Fields & Update Mask
    const fields = {};
    const updateMasks = [];

    if (payload.priceType !== undefined || payload.price !== undefined || payload.mrpOrMaxPrice !== undefined) {
      const priceTypeVal = payload.priceType ? String(payload.priceType).toLowerCase() : 'fixed';
      
      fields.priceType = { stringValue: priceTypeVal };
      updateMasks.push('updateMask.fieldPaths=priceType');

      if (priceTypeVal === 'range') {
        const minVal = Number(payload.price || 0);
        const maxVal = Number(payload.mrpOrMaxPrice || 0);
        
        fields.priceMin = { doubleValue: minVal };
        fields.priceMax = { doubleValue: maxVal };
        fields.price = { doubleValue: minVal };
        fields.mrp = { doubleValue: maxVal };
        
        updateMasks.push('updateMask.fieldPaths=priceMin');
        updateMasks.push('updateMask.fieldPaths=priceMax');
        updateMasks.push('updateMask.fieldPaths=price');
        updateMasks.push('updateMask.fieldPaths=mrp');
      } else if (priceTypeVal === 'fixed') {
        const priceVal = Number(payload.price || 0);
        const mrpVal = Number(payload.mrpOrMaxPrice || 0);
        const discountVal = mrpVal > 0 ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 0;

        fields.price = { doubleValue: priceVal };
        fields.mrp = { doubleValue: mrpVal };
        fields.discount = { integerValue: discountVal };
        
        updateMasks.push('updateMask.fieldPaths=price');
        updateMasks.push('updateMask.fieldPaths=mrp');
        updateMasks.push('updateMask.fieldPaths=discount');
      } else if (priceTypeVal === 'hidden') {
        fields.price = { doubleValue: 0 };
        fields.mrp = { doubleValue: 0 };
        
        updateMasks.push('updateMask.fieldPaths=price');
        updateMasks.push('updateMask.fieldPaths=mrp');
      }
    }
    if (payload.brand !== undefined) {
      fields.brand = { stringValue: String(payload.brand) };
      updateMasks.push('updateMask.fieldPaths=brand');
    }
    if (payload.inStock !== undefined) {
      fields.inStock = { booleanValue: Boolean(payload.inStock) };
      updateMasks.push('updateMask.fieldPaths=inStock');
    }
    if (payload.featured !== undefined) {
      fields.featured = { booleanValue: Boolean(payload.featured) };
      updateMasks.push('updateMask.fieldPaths=featured');
    }
    if (payload.moq !== undefined) {
      fields.moq = { stringValue: String(payload.moq || '') };
      updateMasks.push('updateMask.fieldPaths=moq');
    }
    if (payload.badge !== undefined) {
      const badgeVal = (payload.badge === 'None' || !payload.badge) ? '' : String(payload.badge);
      fields.badge = { stringValue: badgeVal };
      updateMasks.push('updateMask.fieldPaths=badge');
    }
    if (payload.trustBadges !== undefined) {
      const badgeList = String(payload.trustBadges || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      fields.trustBadges = {
        arrayValue: {
          values: badgeList.map(b => ({ stringValue: b }))
        }
      };
      updateMasks.push('updateMask.fieldPaths=trustBadges');
    }

    if (updateMasks.length === 0) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'No fields to update.' }),
      };
    }

    // 5. Execute Firestore Update PATCH Request
    const updateQuery = updateMasks.join('&');
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products/${id}?key=${apiKey}&${updateQuery}`;

    console.log(`Sending PATCH request to update product ${id}...`);
    const dbRes = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fields }),
    });

    if (!dbRes.ok) {
      const dbError = await dbRes.text();
      console.error('Firestore PATCH update failed:', dbError);
      return {
        statusCode: dbRes.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Firestore update failed: ${dbRes.statusText}` }),
      };
    }

    console.log(`Product ${id} updated successfully.`);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: `Product ${id} synced successfully.` }),
    };

  } catch (err) {
    console.error('Sync Serverless Function caught error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || 'Internal Server Error' }),
    };
  }
};
