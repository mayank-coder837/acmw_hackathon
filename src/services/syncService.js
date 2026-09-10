// Real-Time Multi-User Synchronization Service
// Combines local BroadcastChannel with Firebase Firestore for real-time deployed sync across devices.
// Provides live feed events for saves, new spots, peer radar pings, and buzzing Blip invites.

import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const CHANNEL_NAME = 'blip_live_sync';

class SyncService {
  constructor() {
    this.channel = null;
    this.listeners = new Set();
    this.ambientTimer = null;
    this.firestoreUnsubscribe = null;
    this.clientId = typeof window !== 'undefined'
      ? `client_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
      : 'server';

    this.initChannel();
    this.initFirestoreSync();
  }

  initChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.clientId !== this.clientId) {
            this.notifyListeners(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment:', e);
    }
  }

  // Real-time multi-device cloud listener when deployed
  initFirestoreSync() {
    if (!db || typeof window === 'undefined') return;

    try {
      const eventsRef = collection(db, 'blip_live_events');
      const q = query(eventsRef, orderBy('timestamp', 'desc'), limit(30));

      this.firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // Filter out events emitted by this exact client tab
            if (data && data.clientId !== this.clientId) {
              this.notifyListeners(data);
            }
          }
        });
      }, (err) => {
        // Firestore rules might not be set up, so log informatively without breaking
        console.warn('Firestore real-time sync notice:', err.message);
      });
    } catch (e) {
      console.warn('Could not initialize Firestore sync:', e);
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

  // Universal publisher: broadcasts to local tabs + deployed peers via Firestore
  publish(payload) {
    if (!payload.clientId) {
      payload.clientId = this.clientId;
    }

    // 1. Post to local browser tabs
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn('BroadcastChannel publish error:', e);
      }
    }

    // 2. Notify current tab listeners
    this.notifyListeners(payload);

    // 3. Post to Firestore for real-time sync across different deployed devices/phones
    if (db) {
      try {
        const cleanPayload = JSON.parse(JSON.stringify(payload));
        addDoc(collection(db, 'blip_live_events'), cleanPayload).catch((err) => {
          console.warn('Firestore broadcast note:', err?.message || err);
        });
      } catch (err) {
        console.warn('Firestore publish error:', err);
      }
    }
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

    this.publish(payload);
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

    this.publish(payload);
  }

  // Broadcast a friend request
  broadcastFriendRequest(request) {
    const payload = {
      type: 'FRIEND_REQUEST',
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      request,
      timestamp: Date.now()
    };

    this.publish(payload);

    // If sent to a simulated peer (starts with 'peer_'), simulate accept after 2 seconds
    if (request.toUser?.uid?.startsWith('peer_')) {
      setTimeout(() => {
        const acceptPayload = {
          type: 'FRIEND_REQUEST_ACCEPTED',
          id: `act_${Date.now()}_acc`,
          requestId: request.id,
          fromUser: request.toUser,
          toUser: request.fromUser,
          timestamp: Date.now()
        };
        this.publish(acceptPayload);
      }, 2000);
    }
  }

  // Broadcast friend request accepted
  broadcastFriendAccepted(requestId, fromUser, toUser) {
    const payload = {
      type: 'FRIEND_REQUEST_ACCEPTED',
      id: `act_${Date.now()}_acc`,
      requestId,
      fromUser,
      toUser,
      timestamp: Date.now()
    };

    this.publish(payload);
  }

  // Broadcast collaborative place plan / Blip Invite ("You Have Been Bliped!")
  broadcastBlipInvite(plan) {
    const payload = {
      type: 'BLIP_INVITE',
      id: `act_${Date.now()}_blip`,
      plan,
      timestamp: Date.now()
    };

    this.publish(payload);

    // If user bliped simulated peers, have one of them accept with an excited message
    const hasPeer = plan.invitedFriends?.some((f) => f.uid?.startsWith('peer_'));
    if (hasPeer) {
      setTimeout(() => {
        const peer = plan.invitedFriends.find((f) => f.uid?.startsWith('peer_'));
        const responsePayload = {
          type: 'PLAN_RESPONSE',
          id: `act_${Date.now()}_resp`,
          planId: plan.id,
          responder: peer || { displayName: 'Maya S.' },
          status: 'accepted',
          message: 'Count me in! See you there! ⚡',
          timestamp: Date.now()
        };
        this.publish(responsePayload);
      }, 3500);
    }
  }

  // Broadcast response to a plan
  broadcastPlanResponse(planId, responder, status) {
    const payload = {
      type: 'PLAN_RESPONSE',
      id: `act_${Date.now()}_resp`,
      planId,
      responder,
      status,
      timestamp: Date.now()
    };

    this.publish(payload);
  }

  // Broadcast updated saved spots to friends
  broadcastSavedSpotsSync(user, savedSpotIds) {
    const payload = {
      type: 'FRIEND_SAVED_SPOTS_SYNC',
      id: `act_${Date.now()}_sync`,
      user: {
        uid: user.uid,
        displayName: user.displayName
      },
      savedSpotIds,
      timestamp: Date.now()
    };

    this.publish(payload);
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
