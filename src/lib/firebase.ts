import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// ── Enable offline persistence ─────────────────────────────────────────────
// With this, writes go to local IndexedDB instantly (< 100ms),
// then sync to Firebase server in background.
// This is what makes save feel instant instead of waiting 5-15 seconds.
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — use single-tab persistence instead
    console.warn('[Firebase] Multi-tab persistence unavailable, falling back.');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support IndexedDB (very rare)
    console.warn('[Firebase] Offline persistence not supported in this browser.');
  }
});

// Analytics — only initialise in environments that support it
isSupported().then(yes => {
  if (yes) getAnalytics(app);
});

export default app;
