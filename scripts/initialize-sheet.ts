import crypto from 'crypto';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env.local') });

// ─── Generate Google Sheets OAuth2 Access Token ──────────────────────────────
function base64url(strOrBuffer: string | Buffer) {
  const buf = Buffer.isBuffer(strOrBuffer) ? strOrBuffer : Buffer.from(strOrBuffer);
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getGoogleAccessToken(email: string, privateKey: string) {
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
    throw new Error(`Failed to get Google Access Token: ${await tokenRes.text()}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function run() {
  console.log("Starting Google Sheet initialization...");
  try {
    const googleEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!googleEmail || !googlePrivateKey || !spreadsheetId) {
      throw new Error("Missing credentials in .env.local");
    }

    console.log("Fetching Google Access Token...");
    const accessToken = await getGoogleAccessToken(googleEmail, googlePrivateKey);
    console.log("Access Token acquired successfully!");

    // 1. Fetch spreadsheet metadata to get all sheet tabs and their IDs
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
    const metaRes = await fetch(metaUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!metaRes.ok) {
      throw new Error(`Failed to get spreadsheet metadata: ${await metaRes.text()}`);
    }

    const spreadsheetData = await metaRes.json();
    const sheets = spreadsheetData.sheets || [];

    console.log(`Found ${sheets.length} worksheets/tabs in your spreadsheet.`);

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
      'MRP / Max Price (AED)'
    ];

    const requests: any[] = [];

    for (const sheet of sheets) {
      const sheetId = sheet.properties.sheetId;
      const sheetTitle = sheet.properties.title;

      console.log(`Preparing updates for tab: "${sheetTitle}" (ID: ${sheetId})...`);

      // Update headers for each sheet (writes to row 1, cols A to M)
      const rangeHeader = `${sheetTitle}!A1:M1`;
      const updateHeadersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeHeader)}?valueInputOption=USER_ENTERED`;
      const headerRes = await fetch(updateHeadersUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ values: [headers] })
      });

      if (!headerRes.ok) {
        throw new Error(`Failed to update headers for sheet "${sheetTitle}": ${await headerRes.text()}`);
      }

      // Add Data Validation requests for columns F, G, H, K, L
      // Column F (5): Price Type
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 5, endColumnIndex: 6 },
          rule: {
            condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'fixed' }, { userEnteredValue: 'range' }, { userEnteredValue: 'hidden' }] },
            showCustomUi: true,
            strict: true
          }
        }
      });

      // Column G (6): Stock Status
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 6, endColumnIndex: 7 },
          rule: {
            condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'In Stock' }, { userEnteredValue: 'Out of Stock' }] },
            showCustomUi: true,
            strict: true
          }
        }
      });

      // Column H (7): Featured
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 7, endColumnIndex: 8 },
          rule: {
            condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'Yes' }, { userEnteredValue: 'No' }] },
            showCustomUi: true,
            strict: true
          }
        }
      });

      // Column K (10): Product Badge
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 10, endColumnIndex: 11 },
          rule: {
            condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'None' }, { userEnteredValue: 'New' }, { userEnteredValue: 'Featured' }, { userEnteredValue: 'Hot Deal' }] },
            showCustomUi: true,
            strict: true
          }
        }
      });

      // Column L (11): Trust Badges (not strict, allows multiple comma-separated entries, but provides helpers)
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 2000, startColumnIndex: 11, endColumnIndex: 12 },
          rule: {
            condition: {
              type: 'ONE_OF_LIST',
              values: [
                { userEnteredValue: 'Verified Supplier' },
                { userEnteredValue: 'Export Ready' },
                { userEnteredValue: 'ISO Certified' },
                { userEnteredValue: 'GCC Supply' },
                { userEnteredValue: 'Fast Dispatch' }
              ]
            },
            showCustomUi: true,
            strict: false // allows entering multiple values like "Verified Supplier, Export Ready"
          }
        }
      });
    }

    if (requests.length > 0) {
      console.log("Applying Data Validation rules (dropdowns) to all tabs...");
      const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
      const batchRes = await fetch(batchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ requests })
      });

      if (!batchRes.ok) {
        throw new Error(`Failed to apply validation rules: ${await batchRes.text()}`);
      }

      console.log("🎉 Google Sheet successfully configured with new columns and dropdown validations!");
    } else {
      console.log("No tabs found to configure.");
    }
  } catch (err: any) {
    console.error("Initialization failed:", err.message || err);
  }
}

run();
