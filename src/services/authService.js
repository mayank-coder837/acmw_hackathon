// Lightweight zero-friction identity service
// Creates silent anonymous session on launch; offers one-tap account link upgrade.

const AUTH_STORAGE_KEY = 'blip_auth_user';

const RANDOM_NAMES = [
  'NeonNomad', 'CyberScout', 'UrbanFox', 'CosmicRambler', 
  'DriftWalker', 'VelvetProwler', 'SolarRider', 'MetroBlip',
  'EchoChaser', 'PixelStrider', 'AuraHiker', 'NovaWanderer'
];

const AVATAR_COLORS = [
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #10b981, #06b6d4)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #6366f1, #a855f7)'
];

export const authService = {
  // Get current user or create silent anonymous user
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('LocalStorage error reading user session:', e);
    }

    // First time opening: silently generate anonymous session
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const nameIndex = Math.floor(Math.random() * RANDOM_NAMES.length);
    const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length);
    const displayName = `${RANDOM_NAMES[nameIndex]}_${randomSuffix}`;
    const uid = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();

    const newUser = {
      uid,
      displayName,
      email: null,
      isAnonymous: true,
      avatarColor: AVATAR_COLORS[colorIndex],
      initials: displayName.substring(0, 2).toUpperCase(),
      createdAt: Date.now()
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to save anonymous session:', e);
    }

    return newUser;
  },

  // Upgrade anonymous account to linked account (Google / Cloud)
  // Preserves existing saved spot list and links identity
  async upgradeAccount(email, displayName) {
    const currentUser = this.getCurrentUser();
    
    // Simulate network delay for realistic authentication flow
    await new Promise((r) => setTimeout(r, 600));

    const upgradedUser = {
      ...currentUser,
      displayName: displayName || currentUser.displayName,
      email: email || `${currentUser.displayName.toLowerCase()}@gmail.com`,
      isAnonymous: false,
      linkedAt: Date.now(),
      provider: 'google.com'
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(upgradedUser));
    } catch (e) {
      console.error('Failed to save upgraded user:', e);
    }

    // Notify listeners
    window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: upgradedUser }));
    return upgradedUser;
  },

  // Reset/Sign out to new anonymous identity (for demo / testing)
  resetAnonymousSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    const newUser = this.getCurrentUser();
    window.dispatchEvent(new CustomEvent('blip_auth_changed', { detail: newUser }));
    return newUser;
  }
};
