import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const backupDir = path.resolve(import.meta.dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const collections = ['products', 'blogs', 'settings', 'videos', 'redirects', 'images_seo', 'dm_employees'];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folderPath = path.join(backupDir, `backup_sdk_${timestamp}`);
    fs.mkdirSync(folderPath);

    for (const col of collections) {
      console.log(`Fetching collection "${col}" via Web SDK...`);
      try {
        const querySnapshot = await getDocs(collection(db, col));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filePath = path.join(folderPath, `${col}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Saved "${col}" backup (${data.length} docs) to ${filePath}`);
      } catch (err: any) {
        console.error(`Failed to fetch collection "${col}":`, err.message || err);
      }
    }
    console.log(`\n🎉 Backup process completed! Folder created: backups/backup_sdk_${timestamp}`);
  } catch (err) {
    console.error('Backup script execution failed:', err);
  }
}

run();
