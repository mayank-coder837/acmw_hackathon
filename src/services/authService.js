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
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

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
  const colorIndex = Math.abs(fbUser.uid.charCodeAt(0) + (fbUser.uid.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
  const displayName = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Explorer');
  const isGoogle = fbUser.providerData?.some((p) => p.providerId === 'google.com');

  return {
    uid: fbUser.uid,
    displayName,
    email: fbUser.email,
    photoURL: fbUser.photoURL || null,
    isAnonymous: false,
    emailVerified: isGoogle ? true : Boolean(fbUser.emailVerified),
    avatarColor: AVATAR_COLORS[colorIndex],
    initials: displayName.substring(0, 2).toUpperCase(),
    provider: isGoogle ? 'google' : 'email',
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

const DEMO_ACCOUNTS_KEY = 'blip_demo_accounts';
const DEMO_SESSION_KEY = 'blip_demo_session_user';

function getDemoAccounts() {
  try {
    const stored = localStorage.getItem(DEMO_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (_) {
    return {};
  }
}

function saveDemoAccounts(accounts) {
  try {
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (_) {}
}

function getStoredDemoUser() {
  try {
    const stored = localStorage.getItem(DEMO_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (_) {
    return null;
  }
}

function persistDemoUser(user) {
  try {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
  } catch (_) {}
}

function clearDemoUser() {
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch (_) {}
}

function createDemoUser(email, displayName) {
  const finalEmail = String(email).trim().toLowerCase();
  const name = (displayName || finalEmail.split('@')[0]).trim();
  return {
    uid: `demo_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`,
    displayName: name,
    email: finalEmail,
    isAnonymous: false,
    emailVerified: true,
    avatarColor: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    initials: name.substring(0, 2).toUpperCase(),
    provider: 'email',
    createdAt: Date.now(),
  };
}

export const authService = {
  // Returns the current user (Firebase or anonymous).
  // This is sync — returns cached value. Real state comes from onAuthStateChanged.
  getCurrentUser() {
    if (isFirebaseConfigured && auth && auth.currentUser) {
      return firebaseUserToBlip(auth.currentUser);
    }

    if (!isFirebaseConfigured) {
      const storedDemoUser = getStoredDemoUser();
      if (storedDemoUser) {
        _currentLocalUser = storedDemoUser;
        return storedDemoUser;
      }
    }

    if (!_currentLocalUser) {
      _currentLocalUser = getOrCreateAnonUser();
    }
    return _currentLocalUser;
  },

  // Subscribe to real-time auth state changes.
  // callback(blipUser) is called immediately and on every change.
  onAuthStateChanged(callback) {
    if (!isFirebaseConfigured) {
      const current = this.getCurrentUser();
      callback(current);
      return () => {};
    }

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
    if (!isFirebaseConfigured) {
      const normalizedEmail = email.trim().toLowerCase();
      const accounts = getDemoAccounts();
      if (accounts[normalizedEmail]) {
        return { error: 'This email is already registered. Try signing in instead.' };
      }

      const user = createDemoUser(normalizedEmail, displayName);
      accounts[normalizedEmail] = { email: normalizedEmail, password, displayName: user.displayName };
      saveDemoAccounts(accounts);
      persistDemoUser(user);
      _currentLocalUser = user;
      window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: user }));
      return { success: true, user, requiresVerification: false };
    }

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
    if (!isFirebaseConfigured) {
      const normalizedEmail = email.trim().toLowerCase();
      const accounts = getDemoAccounts();
      const account = accounts[normalizedEmail];

      if (!account) {
        return { error: 'Incorrect email or password. Please try again.' };
      }

      if (String(account.password) !== String(password)) {
        return { error: 'Incorrect email or password. Please try again.' };
      }

      const user = {
        ...createDemoUser(normalizedEmail, account.displayName || normalizedEmail.split('@')[0]),
        uid: `demo_${normalizedEmail.replace(/[^a-z0-9]/gi, '').slice(0, 10)}_${Date.now()}`,
      };
      persistDemoUser(user);
      _currentLocalUser = user;
      window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: user }));
      return { success: true, user };
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
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
    if (!isFirebaseConfigured) {
      const normalizedEmail = email.trim().toLowerCase();
      const accounts = getDemoAccounts();
      if (!accounts[normalizedEmail]) {
        return { error: 'No account exists for this email address.' };
      }
      return { success: true };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err) {
      return { error: mapFirebaseError(err.code) };
    }
  },

  // Resend email verification to the currently signed-in (unverified) user.
  async resendVerification() {
    if (!isFirebaseConfigured) {
      return { success: true };
    }

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
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
      clearDemoUser();
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
    clearDemoUser();
    _currentLocalUser = null;
    const newUser = getOrCreateAnonUser();
    _currentLocalUser = newUser;
    window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: newUser }));
    return newUser;
  },

  // Sign in or sign up with Google
  async signInWithGoogle() {
    if (!isFirebaseConfigured || !auth) {
      // Graceful fallback for demo/preview environments without configured Firebase credentials
      const googleEmail = 'google.explorer@gmail.com';
      const googleName = 'Google Explorer';
      const user = {
        uid: `google_demo_${Date.now()}`,
        displayName: googleName,
        email: googleEmail,
        photoURL: null,
        isAnonymous: false,
        emailVerified: true,
        avatarColor: 'linear-gradient(135deg, #4285F4, #34A853)',
        initials: 'GE',
        provider: 'google',
        createdAt: Date.now(),
      };
      persistDemoUser(user);
      _currentLocalUser = user;
      window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: user }));
      return { success: true, user };
    }

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const user = firebaseUserToBlip(credential.user);
      _currentLocalUser = user;
      window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: user }));
      return { success: true, user };
    } catch (err) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return { error: 'Google sign-in window was closed before finishing.' };
      }
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true, redirected: true };
        } catch (_) {
          return { error: 'Popup blocked by browser. Please enable popups or tap again.' };
        }
      }
      if (err.code === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        return {
          error: `Domain unauthorized in Firebase. Add "${currentHost}" in Firebase Console → Authentication → Settings → Authorized domains.`,
        };
      }
      return { error: mapFirebaseError(err.code) };
    }
  },

  // Check redirect result on startup if redirect sign-in was triggered on mobile
  async checkRedirectResult() {
    if (isFirebaseConfigured && auth) {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const user = firebaseUserToBlip(result.user);
          _currentLocalUser = user;
          window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: user }));
          return user;
        }
      } catch (e) {
        console.warn('Redirect check failed:', e);
      }
    }
    return null;
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
    case 'auth/popup-closed-by-user':
      return 'Google sign-in window was closed before finishing.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in window is already active.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email under a different sign-in method.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
