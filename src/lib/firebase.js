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
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

const hasPlaceholderValues = Object.values(firebaseConfig).some((value) => {
  if (!value) return true;
  return /YOUR_|your_|example|placeholder|project_id|api_key|sender_id/i.test(String(value));
});

export const isFirebaseConfigured = !hasPlaceholderValues;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export default app;
