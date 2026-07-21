const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch (_) {}

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'al-zaydan-international';
const API_KEY = process.env.VITE_FIREBASE_API_KEY;

function convertValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(v => convertValue(v));
  }
  if ('mapValue' in val) {
    const obj = {};
    const fields = val.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      obj[k] = convertValue(v);
    }
    return obj;
  }
  return null;
}

function mapDocument(doc) {
  const fields = doc.fields || {};
  const obj = {};
  const nameParts = doc.name.split('/');
  obj.id = nameParts[nameParts.length - 1];
  for (const [k, v] of Object.entries(fields)) {
    obj[k] = convertValue(v);
  }
  return obj;
}

async function backupCollection(collectionId) {
  console.log(`Backing up collection: "${collectionId}"...`);
  let documents = [];
  let pageToken = '';
  do {
    let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionId}?pageSize=300`;
    if (API_KEY) url += `&key=${API_KEY}`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Firestore responded ${res.status}: ${errText}`);
    }
    const data = await res.json();
    
    if (data.documents) {
      documents.push(...data.documents.map(mapDocument));
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  console.log(`Successfully fetched ${documents.length} documents from "${collectionId}".`);
  return documents;
}

async function run() {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const collections = ['products', 'categories', 'blogs', 'settings'];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderPath = path.join(backupDir, `backup_${timestamp}`);
    fs.mkdirSync(folderPath);

    for (const col of collections) {
      try {
        const data = await backupCollection(col);
        const filePath = path.join(folderPath, `${col}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Saved "${col}" backup to ${filePath}`);
      } catch (err) {
        console.error(`Failed to backup collection "${col}":`, err.message);
      }
    }
    console.log(`\n🎉 Database backup completed successfully! Folder created: backups/backup_${timestamp}`);
  } catch (err) {
    console.error('Backup script execution failed:', err);
  }
}

run();
