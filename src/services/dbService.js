import { openDB } from 'idb';
import { SEED_SPOTS } from '../data/seedSpots';

const DB_NAME = 'blip_local_db';
const DB_VERSION = 1;

let dbPromise = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Spots store
        if (!db.objectStoreNames.contains('spots')) {
          const spotStore = db.createObjectStore('spots', { keyPath: 'id' });
          spotStore.createIndex('category', 'category', { unique: false });
          spotStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        // Saved bookmarks store: key is `${uid}_${spotId}`
        if (!db.objectStoreNames.contains('saved_spots')) {
          const savedStore = db.createObjectStore('saved_spots', { keyPath: 'savedKey' });
          savedStore.createIndex('uid', 'uid', { unique: false });
          savedStore.createIndex('spotId', 'spotId', { unique: false });
        }
      }
    }).catch((err) => {
      console.warn('IndexedDB unavailable, falling back to LocalStorage:', err);
      return null;
    });
  }
  return dbPromise;
}

export const dbService = {
  // Initialize local DB and ensure seed spots are cached
  async init() {
    try {
      const db = await getDB();
      if (db) {
        const count = await db.count('spots');
        if (count === 0) {
          const tx = db.transaction('spots', 'readwrite');
          for (const spot of SEED_SPOTS) {
            await tx.store.put(spot);
          }
          await tx.done;
        }
      } else {
        // LocalStorage fallback
        if (!localStorage.getItem('blip_spots')) {
          localStorage.setItem('blip_spots', JSON.stringify(SEED_SPOTS));
        }
      }
    } catch (e) {
      console.error('dbService init error:', e);
    }
  },

  // Get all spots cached locally
  async getAllSpots() {
    try {
      const db = await getDB();
      if (db) {
        const spots = await db.getAll('spots');
        if (spots && spots.length > 0) return spots;
      }
      const raw = localStorage.getItem('blip_spots');
      return raw ? JSON.parse(raw) : SEED_SPOTS;
    } catch (e) {
      console.warn('Falling back to seed spots:', e);
      return SEED_SPOTS;
    }
  },

  // Save or update a spot locally
  async saveSpot(spot) {
    try {
      const db = await getDB();
      if (db) {
        await db.put('spots', spot);
      }
      const spots = await this.getAllSpots();
      const index = spots.findIndex((s) => s.id === spot.id);
      if (index >= 0) {
        spots[index] = spot;
      } else {
        spots.unshift(spot);
      }
      localStorage.setItem('blip_spots', JSON.stringify(spots));
      return spot;
    } catch (e) {
      console.error('Error saving spot locally:', e);
      return spot;
    }
  },

  // Increment save count on a spot
  async incrementSaveCount(spotId) {
    try {
      const spots = await this.getAllSpots();
      const target = spots.find((s) => s.id === spotId);
      if (target) {
        target.saveCount = (target.saveCount || 0) + 1;
        await this.saveSpot(target);
      }
    } catch (e) {
      console.error('Error incrementing save count:', e);
    }
  },

  // Decrement save count on a spot
  async decrementSaveCount(spotId) {
    try {
      const spots = await this.getAllSpots();
      const target = spots.find((s) => s.id === spotId);
      if (target && target.saveCount > 0) {
        target.saveCount -= 1;
        await this.saveSpot(target);
      }
    } catch (e) {
      console.error('Error decrementing save count:', e);
    }
  },

  // Get saved spot IDs for a user
  async getUserSavedSpotIds(uid) {
    try {
      const db = await getDB();
      if (db) {
        const savedList = await db.getAllFromIndex('saved_spots', 'uid', uid);
        return savedList.map((item) => item.spotId);
      }
      const key = `blip_saved_${uid}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      const key = `blip_saved_${uid}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    }
  },

  // Toggle saving a spot for user
  async toggleSaveSpot(uid, spotId) {
    try {
      const db = await getDB();
      const savedKey = `${uid}_${spotId}`;
      const isSaved = await this.isSpotSaved(uid, spotId);

      if (isSaved) {
        // Remove
        if (db) {
          await db.delete('saved_spots', savedKey);
        }
        const key = `blip_saved_${uid}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = existing.filter((id) => id !== spotId);
        localStorage.setItem(key, JSON.stringify(filtered));
        await this.decrementSaveCount(spotId);
        return false;
      } else {
        // Add
        if (db) {
          await db.put('saved_spots', {
            savedKey,
            uid,
            spotId,
            savedAt: Date.now()
          });
        }
        const key = `blip_saved_${uid}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (!existing.includes(spotId)) {
          existing.push(spotId);
        }
        localStorage.setItem(key, JSON.stringify(existing));
        await this.incrementSaveCount(spotId);
        return true;
      }
    } catch (e) {
      console.error('Error toggling save spot:', e);
      return false;
    }
  },

  // Check if a spot is saved
  async isSpotSaved(uid, spotId) {
    try {
      const db = await getDB();
      if (db) {
        const record = await db.get('saved_spots', `${uid}_${spotId}`);
        return !!record;
      }
      const key = `blip_saved_${uid}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      return list.includes(spotId);
    } catch (e) {
      const key = `blip_saved_${uid}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      return list.includes(spotId);
    }
  }
};
