// friendService.js — Social Friend System, Saved Spots Sharing, and Collaborative Place Planning for Blip
import { SEED_SPOTS } from '../data/seedSpots';

// Storage keys
const FRIENDS_KEY_PREFIX = 'blip_friends_';
const REQUESTS_KEY_PREFIX = 'blip_friend_requests_';
const PLANS_KEY_PREFIX = 'blip_plans_';

// Initial curated demo friends for instant exploration
const DEMO_FRIENDS = [
  {
    uid: 'peer_maya_s',
    displayName: 'Maya S.',
    handle: '@mayascout',
    avatarColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    initials: 'MS',
    status: 'accepted',
    savedSpotIds: ['spot_1', 'spot_3', 'spot_7', 'spot_12'],
    bio: 'Coffee connoisseur & hidden architecture spotter',
    addedAt: Date.now() - 86400000 * 3
  },
  {
    uid: 'peer_leo_v',
    displayName: 'Leo V.',
    handle: '@leovibe',
    avatarColor: 'linear-gradient(135deg, #10b981, #06b6d4)',
    initials: 'LV',
    status: 'accepted',
    savedSpotIds: ['spot_2', 'spot_4', 'spot_8', 'spot_10'],
    bio: 'Late night ramen & indie gallery enthusiast',
    addedAt: Date.now() - 86400000 * 2
  },
  {
    uid: 'peer_amina_z',
    displayName: 'Amina Z.',
    handle: '@aminaz',
    avatarColor: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    initials: 'AZ',
    status: 'accepted',
    savedSpotIds: ['spot_5', 'spot_6', 'spot_9', 'spot_11'],
    bio: 'Rooftop golden hours & speakeasies',
    addedAt: Date.now() - 86400000 * 1
  }
];

class FriendService {
  // --- Storage Accessors ---

  getFriends(currentUid) {
    if (!currentUid) return [];
    try {
      const key = `${FRIENDS_KEY_PREFIX}${currentUid}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      // Initialize with default demo friends so user can test right away
      localStorage.setItem(key, JSON.stringify(DEMO_FRIENDS));
      return DEMO_FRIENDS;
    } catch (e) {
      console.warn('Error reading friends:', e);
      return DEMO_FRIENDS;
    }
  }

  saveFriends(currentUid, friends) {
    if (!currentUid) return;
    try {
      const key = `${FRIENDS_KEY_PREFIX}${currentUid}`;
      localStorage.setItem(key, JSON.stringify(friends));
    } catch (e) {
      console.warn('Error saving friends:', e);
    }
  }

  getRequests(currentUid) {
    if (!currentUid) return [];
    try {
      const key = `${REQUESTS_KEY_PREFIX}${currentUid}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Error reading friend requests:', e);
      return [];
    }
  }

  saveRequests(currentUid, requests) {
    if (!currentUid) return;
    try {
      const key = `${REQUESTS_KEY_PREFIX}${currentUid}`;
      localStorage.setItem(key, JSON.stringify(requests));
    } catch (e) {
      console.warn('Error saving friend requests:', e);
    }
  }

  getPlans(currentUid) {
    if (!currentUid) return [];
    try {
      const key = `${PLANS_KEY_PREFIX}${currentUid}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      // Initial sample plan for immediate delight
      const initialPlans = [
        {
          id: 'plan_seed_1',
          spotId: 'spot_1',
          spotName: '% Arabica Roastery',
          spotCategory: 'cafe',
          spotEmoji: '☕',
          creator: {
            uid: 'peer_maya_s',
            displayName: 'Maya S.',
            avatarColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            initials: 'MS'
          },
          invitedFriends: [
            {
              uid: currentUid,
              displayName: 'You',
              status: 'accepted'
            }
          ],
          dateTime: 'Tonight at 8:00 PM',
          note: 'Let’s check out the Kyoto-style pour overs and catch up!',
          createdAt: Date.now() - 3600000,
          status: 'accepted'
        }
      ];
      localStorage.setItem(key, JSON.stringify(initialPlans));
      return initialPlans;
    } catch (e) {
      console.warn('Error reading plans:', e);
      return [];
    }
  }

  savePlans(currentUid, plans) {
    if (!currentUid) return;
    try {
      const key = `${PLANS_KEY_PREFIX}${currentUid}`;
      localStorage.setItem(key, JSON.stringify(plans));
    } catch (e) {
      console.warn('Error saving plans:', e);
    }
  }

  // --- Friend Status Checks ---

  isFriend(currentUid, targetUid) {
    if (!currentUid || !targetUid || currentUid === targetUid) return false;
    const friends = this.getFriends(currentUid);
    return friends.some((f) => f.uid === targetUid);
  }

  hasPendingRequest(currentUid, targetUid) {
    if (!currentUid || !targetUid) return false;
    const requests = this.getRequests(currentUid);
    return requests.some(
      (r) =>
        r.status === 'pending' &&
        ((r.fromUser?.uid === currentUid && r.toUser?.uid === targetUid) ||
          (r.fromUser?.uid === targetUid && r.toUser?.uid === currentUid))
    );
  }

  // --- Friend Request Actions ---

  sendFriendRequest(currentUser, targetUser) {
    if (!currentUser || !targetUser || currentUser.uid === targetUser.uid) {
      return null;
    }

    if (this.isFriend(currentUser.uid, targetUser.uid)) {
      return { status: 'already_friends' };
    }

    const requests = this.getRequests(currentUser.uid);
    const existing = requests.find(
      (r) =>
        r.status === 'pending' &&
        r.fromUser?.uid === currentUser.uid &&
        r.toUser?.uid === targetUser.uid
    );
    if (existing) return existing;

    const newRequest = {
      id: `freq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      fromUser: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        handle: currentUser.handle || `@${currentUser.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        avatarColor: currentUser.avatarColor,
        initials: currentUser.initials || currentUser.displayName.substring(0, 2).toUpperCase()
      },
      toUser: {
        uid: targetUser.uid,
        displayName: targetUser.displayName,
        handle: targetUser.handle || `@${targetUser.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        avatarColor: targetUser.avatarColor,
        initials: targetUser.initials || targetUser.displayName.substring(0, 2).toUpperCase()
      },
      status: 'pending',
      timestamp: Date.now()
    };

    requests.unshift(newRequest);
    this.saveRequests(currentUser.uid, requests);
    return newRequest;
  }

  receiveIncomingRequest(currentUid, request) {
    if (!currentUid || !request) return;
    const requests = this.getRequests(currentUid);
    if (!requests.some((r) => r.id === request.id)) {
      requests.unshift(request);
      this.saveRequests(currentUid, requests);
    }
  }

  acceptFriendRequest(currentUser, requestId) {
    const requests = this.getRequests(currentUser.uid);
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return null;

    targetReq.status = 'accepted';
    this.saveRequests(currentUser.uid, requests);

    // Determine who the other friend is
    const friendInfo = targetReq.fromUser.uid === currentUser.uid ? targetReq.toUser : targetReq.fromUser;

    const friends = this.getFriends(currentUser.uid);
    if (!friends.some((f) => f.uid === friendInfo.uid)) {
      friends.unshift({
        uid: friendInfo.uid,
        displayName: friendInfo.displayName,
        handle: friendInfo.handle || `@${friendInfo.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        avatarColor: friendInfo.avatarColor,
        initials: friendInfo.initials,
        savedSpotIds: friendInfo.savedSpotIds || ['spot_1', 'spot_2'],
        addedAt: Date.now()
      });
      this.saveFriends(currentUser.uid, friends);
    }

    return friendInfo;
  }

  declineFriendRequest(currentUser, requestId) {
    const requests = this.getRequests(currentUser.uid);
    const targetReq = requests.find((r) => r.id === requestId);
    if (targetReq) {
      targetReq.status = 'declined';
      this.saveRequests(currentUser.uid, requests);
    }
    return targetReq;
  }

  removeFriend(currentUser, friendUid) {
    const friends = this.getFriends(currentUser.uid);
    const filtered = friends.filter((f) => f.uid !== friendUid);
    this.saveFriends(currentUser.uid, filtered);
    return filtered;
  }

  // --- Saved Spots of Friends ---

  getFriendSavedSpots(friend, allSpots) {
    if (!friend) return [];
    const spotIds = friend.savedSpotIds || [];
    const found = allSpots.filter((s) => spotIds.includes(s.id));
    if (found.length > 0) return found;

    // If not found in current loaded spots, check SEED_SPOTS
    return SEED_SPOTS.filter((s) => spotIds.includes(s.id));
  }

  updateFriendSavedSpots(currentUid, friendUid, savedSpotIds) {
    const friends = this.getFriends(currentUid);
    const friend = friends.find((f) => f.uid === friendUid);
    if (friend) {
      friend.savedSpotIds = savedSpotIds;
      this.saveFriends(currentUid, friends);
    }
  }

  // --- Place Planning / "Blip Invites" ---

  createPlan(currentUser, { spot, invitedFriends, dateTime, note }) {
    if (!currentUser || !spot) return null;

    const plan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      spotId: spot.id,
      spotName: spot.name,
      spotCategory: spot.category,
      spotEmoji: spot.emoji || '📍',
      spotAddress: spot.address || '',
      lat: spot.lat,
      lng: spot.lng,
      creator: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        avatarColor: currentUser.avatarColor,
        initials: currentUser.initials || currentUser.displayName.substring(0, 2).toUpperCase()
      },
      invitedFriends: invitedFriends.map((f) => ({
        uid: f.uid,
        displayName: f.displayName,
        avatarColor: f.avatarColor,
        status: 'pending'
      })),
      dateTime: dateTime || 'Tonight at 8:00 PM',
      note: note || 'Let’s check out this spot together!',
      createdAt: Date.now(),
      status: 'pending'
    };

    const plans = this.getPlans(currentUser.uid);
    plans.unshift(plan);
    this.savePlans(currentUser.uid, plans);
    return plan;
  }

  receiveIncomingPlan(currentUid, plan) {
    if (!currentUid || !plan) return;
    const plans = this.getPlans(currentUid);
    if (!plans.some((p) => p.id === plan.id)) {
      plans.unshift(plan);
      this.savePlans(currentUid, plans);
    }
  }

  respondToPlan(currentUid, planId, newStatus) {
    const plans = this.getPlans(currentUid);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      plan.status = newStatus;
      if (plan.invitedFriends) {
        const entry = plan.invitedFriends.find((f) => f.uid === currentUid);
        if (entry) entry.status = newStatus;
      }
      this.savePlans(currentUid, plans);
    }
    return plan;
  }

  // --- Futuristic Haptic & Web Audio Sensory Buzz Effect ---
  playBlipBuzzEffect() {
    // 1. Mobile Device Haptic Vibration: distinct cyber buzz cadence
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([220, 80, 220, 80, 420]);
      }
    } catch (_) {}

    // 2. Web Audio API Synthesizer: Futuristic radar buzz chirp
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }

          const now = ctx.currentTime;

          // Double high-tech cyber oscillator burst
          const createPulse = (startTime, freq1, freq2, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq1, startTime);
            osc.frequency.exponentialRampToValueAtTime(freq2, startTime + duration);

            gain.gain.setValueAtTime(0.01, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
          };

          // Pulse 1: high radar chirp
          createPulse(now, 260, 520, 0.16);
          // Pulse 2: follow-up buzz
          createPulse(now + 0.18, 340, 680, 0.22);
          // Pulse 3: deep resonating power blip
          createPulse(now + 0.38, 580, 880, 0.3);
        }
      }
    } catch (err) {
      console.warn('Audio buzz unavailable:', err);
    }
  }
}

export const friendService = new FriendService();
