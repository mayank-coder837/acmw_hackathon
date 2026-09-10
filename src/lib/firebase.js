// Firebase App initialization
// ⚠️  Replace firebaseConfig values with your real Firebase project config.
// Get them at: Firebase Console → Project Settings → "Your apps" → Web app → SDK config
//
// Required setup:
//   1. Go to https://console.firebase.google.com
//   2. Create/select a project
//   3. Authentication → Sign-in method → Enable "Email/Password"
//   4. Project Settings → General → Your apps → Add Web App → copy the config below

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC2u0cbq2C7xT3fG08fUTXAuyCFVlR0sjo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'acmw-hackathon.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'acmw-hackathon',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'acmw-hackathon.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '831480521796',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:831480521796:web:50f36704ad5c4577b6c811',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-4FV1XZFCF9',
};

const hasPlaceholderValues = Object.values(firebaseConfig).some((value) => {
  if (!value) return true;
  return /YOUR_|your_|example|placeholder|project_id|api_key|sender_id/i.test(String(value));
});

export const isFirebaseConfigured = !hasPlaceholderValues;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = isFirebaseConfigured ? getFirestore(app) : null;

export default app;
