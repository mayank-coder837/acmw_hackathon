// authService.js — Firebase Email/Password Authentication Service
// Handles: sign-up, sign-in, sign-out, email verification, password reset, session persistence.
// Falls back to a silent anonymous local session when the user is not signed in.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const ANON_STORAGE_KEY = 'blip_anon_user';

const RANDOM_NAMES = [
  'NeonNomad', 'CyberScout', 'UrbanFox', 'CosmicRambler',
  'DriftWalker', 'VelvetProwler', 'SolarRider', 'MetroBlip',
  'EchoChaser', 'PixelStrider', 'AuraHiker', 'NovaWanderer',
];

const AVATAR_COLORS = [
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #6366f1, #a855f7)',
];

// --- Helpers ---

function randomAnonUser() {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const nameIndex = Math.floor(Math.random() * RANDOM_NAMES.length);
  const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length);
  const displayName = `${RANDOM_NAMES[nameIndex]}_${randomSuffix}`;
  const uid = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  return {
    uid,
    displayName,
    email: null,
    isAnonymous: true,
    emailVerified: false,
    avatarColor: AVATAR_COLORS[colorIndex],
    initials: displayName.substring(0, 2).toUpperCase(),
    createdAt: Date.now(),
  };
}

function firebaseUserToBlip(fbUser) {
  const colorIndex = Math.abs(fbUser.uid.charCodeAt(0) + fbUser.uid.charCodeAt(1)) % AVATAR_COLORS.length;
  const displayName = fbUser.displayName || fbUser.email.split('@')[0];
  return {
    uid: fbUser.uid,
    displayName,
    email: fbUser.email,
    isAnonymous: false,
    emailVerified: fbUser.emailVerified,
    avatarColor: AVATAR_COLORS[colorIndex],
    initials: displayName.substring(0, 2).toUpperCase(),
    provider: 'email',
    createdAt: fbUser.metadata?.creationTime ? new Date(fbUser.metadata.creationTime).getTime() : Date.now(),
  };
}

function getOrCreateAnonUser() {
  try {
    const stored = localStorage.getItem(ANON_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  const user = randomAnonUser();
  try {
    localStorage.setItem(ANON_STORAGE_KEY, JSON.stringify(user));
  } catch (_) {}
  return user;
}

// Validation helpers
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
  return null; // valid
}

// --- Auth State ---

let _currentLocalUser = null;

export const authService = {
  // Returns the current user (Firebase or anonymous).
  // This is sync — returns cached value. Real state comes from onAuthStateChanged.
  getCurrentUser() {
    if (auth.currentUser) {
      return firebaseUserToBlip(auth.currentUser);
    }
    if (!_currentLocalUser) {
      _currentLocalUser = getOrCreateAnonUser();
    }
    return _currentLocalUser;
  },

  // Subscribe to real-time auth state changes.
  // callback(blipUser) is called immediately and on every change.
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        _currentLocalUser = null;
        callback(firebaseUserToBlip(fbUser));
      } else {
        const anonUser = getOrCreateAnonUser();
        _currentLocalUser = anonUser;
        callback(anonUser);
      }
    });
  },

  // Sign up with email and password. Sends verification email.
  // Returns: { success: true } or { error: string }
  async signUp(email, password, displayName) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }
      await sendEmailVerification(credential.user);
      return { success: true, requiresVerification: true };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  },

  // Sign in with email and password.
  // Returns: { success: true, user } or { error: string }
  async signIn(email, password) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        // Sign back out — don't let unverified users through
        await firebaseSignOut(auth);
        return {
          error: 'Please verify your email before signing in. Check your inbox for the verification link.',
          requiresVerification: true,
        };
      }
      return { success: true, user: firebaseUserToBlip(credential.user) };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  },

  // Send password reset email.
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  },

  // Resend email verification to the currently signed-in (unverified) user.
  async resendVerification() {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { error: 'No user session. Please sign up again.' };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  },

  // Sign out — reverts to anonymous local session.
  async signOut() {
    try {
      await firebaseSignOut(auth);
      _currentLocalUser = null;
      localStorage.removeItem(ANON_STORAGE_KEY);
      const newAnon = getOrCreateAnonUser();
      _currentLocalUser = newAnon;
      window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: newAnon }));
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  },

  // Reset anonymous session identity (for demo/testing).
  resetAnonymousSession() {
    localStorage.removeItem(ANON_STORAGE_KEY);
    _currentLocalUser = null;
    const newUser = getOrCreateAnonUser();
    _currentLocalUser = newUser;
    window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: newUser }));
    return newUser;
  },

  // Legacy compat: upgradeAccount used by ProfileModal
  async upgradeAccount(email, displayName) {
    return { email, displayName, isAnonymous: false };
  },
};

// --- Firebase Error Code Mapper ---
function mapFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with uppercase and numbers.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Your account is temporarily locked. Try again later or reset your password.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/expired-action-code':
      return 'This link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'Invalid or already-used link. Please request a new one.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
