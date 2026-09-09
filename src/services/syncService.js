// Real-Time Multi-User Synchronization Service
// Uses BroadcastChannel for instant local inter-tab/browser multi-user sync
// Provides live feed events for saves, new spots, and peer radar pings.

const CHANNEL_NAME = 'blip_live_sync';

class SyncService {
  constructor() {
    this.channel = null;
    this.listeners = new Set();
    this.ambientTimer = null;
    this.initChannel();
  }

  initChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment:', e);
    }
  }

  // Subscribe to live sync events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error('Error in sync listener callback:', err);
      }
    });
  }

  // Broadcast a new spot added by the local user
  broadcastNewSpot(spot, user) {
    const payload = {
      type: 'NEW_SPOT',
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      spot,
      user: {
        uid: user.uid,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous,
        avatarColor: user.avatarColor
      },
      timestamp: Date.now()
    };

    // Notify other tabs
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    // Also notify current tab listeners
    this.notifyListeners(payload);
  }

  // Broadcast that a spot was saved
  broadcastSpotSaved(spot, user, isSaved) {
    if (!isSaved) return; // Only broadcast saves for the feed

    const payload = {
      type: 'SPOT_SAVED',
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      spot: {
        id: spot.id,
        name: spot.name,
        category: spot.category,
        emoji: spot.emoji,
        lat: spot.lat,
        lng: spot.lng
      },
      user: {
        uid: user.uid,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous,
        avatarColor: user.avatarColor
      },
      timestamp: Date.now()
    };

    if (this.channel) {
      this.channel.postMessage(payload);
    }
    this.notifyListeners(payload);
  }

  // Start ambient peer activity simulator (online only)
  startAmbientActivity(isOnline, currentSpots, onNewActivity) {
    if (this.ambientTimer) clearInterval(this.ambientTimer);
    if (!isOnline) return;

    const PEER_NAMES = ['Maya S.', 'Leo V.', 'Devon K.', 'Amina Z.', 'Jordan T.', 'Siddharth R.'];
    const PEER_COLORS = [
      'linear-gradient(135deg, #ec4899, #8b5cf6)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    ];

    // Every 30 seconds, simulate a nearby user bookmarking a random spot
    this.ambientTimer = setInterval(() => {
      if (!isOnline || !currentSpots || currentSpots.length === 0) return;

      const randomSpot = currentSpots[Math.floor(Math.random() * currentSpots.length)];
      const randomUser = PEER_NAMES[Math.floor(Math.random() * PEER_NAMES.length)];
      const randomColor = PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)];

      const ambientEvent = {
        type: 'SPOT_SAVED',
        id: `ambient_${Date.now()}`,
        spot: {
          id: randomSpot.id,
          name: randomSpot.name,
          category: randomSpot.category,
          emoji: randomSpot.emoji,
          lat: randomSpot.lat,
          lng: randomSpot.lng
        },
        user: {
          uid: `peer_${Math.random().toString(36).substr(2, 6)}`,
          displayName: randomUser,
          isAnonymous: false,
          avatarColor: randomColor
        },
        timestamp: Date.now()
      };

      onNewActivity(ambientEvent);
    }, 28000);
  }

  stopAmbientActivity() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }
}

export const syncService = new SyncService();
