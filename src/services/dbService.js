import { openDB } from 'idb';
import { SEED_SPOTS, CATEGORY_FALLBACK_IMAGES } from '../data/seedSpots';
import { placesService } from './placesService';

const DB_NAME = 'blip_local_db';
const DB_VERSION = 2; // Incremented for rich photography and expanded seed migration

let dbPromise = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
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
  // Initialize local DB, backfill images on existing spots, and merge expanded seed blips
  async init() {
    try {
      const db = await getDB();
      if (db) {
        const existingSpots = await db.getAll('spots');
        const existingMap = new Map(existingSpots.map((s) => [s.id, s]));

        const tx = db.transaction('spots', 'readwrite');
        
        // 1. Backfill images on any existing spot lacking an image
        for (const spot of existingSpots) {
          if (!spot.image) {
            const seedMatch = SEED_SPOTS.find((s) => s.id === spot.id);
            spot.image = seedMatch?.image || placesService.getPhotoForPlace(spot.category, spot.tags || [], spot.name);
            await tx.store.put(spot);
          }
        }

        // 2. Add all new seed spots if not already present
        for (const seedSpot of SEED_SPOTS) {
          if (!existingMap.has(seedSpot.id)) {
            await tx.store.put(seedSpot);
          } else {
            // Ensure existing seed spot has updated high-res photo
            const current = existingMap.get(seedSpot.id);
            if (!current.image && seedSpot.image) {
              current.image = seedSpot.image;
              await tx.store.put(current);
            }
          }
        }
        await tx.done;

        // Sync to localStorage
        const all = await db.getAll('spots');
        localStorage.setItem('blip_spots', JSON.stringify(all));
      } else {
        // LocalStorage fallback
        let spots = [];
        const raw = localStorage.getItem('blip_spots');
        if (raw) {
          try {
            spots = JSON.parse(raw);
          } catch {
            spots = [];
          }
        }

        const map = new Map(spots.map((s) => [s.id, s]));
        for (const spot of spots) {
          if (!spot.image) {
            const seedMatch = SEED_SPOTS.find((s) => s.id === spot.id);
            spot.image = seedMatch?.image || placesService.getPhotoForPlace(spot.category, spot.tags || [], spot.name);
          }
        }

        for (const seedSpot of SEED_SPOTS) {
          if (!map.has(seedSpot.id)) {
            spots.push(seedSpot);
          }
        }
        localStorage.setItem('blip_spots', JSON.stringify(spots));
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
        if (spots && spots.length > 0) {
          // Verify images exist on all spots
          return spots.map((spot) => {
            if (!spot.image) {
              return {
                ...spot,
                image: placesService.getPhotoForPlace(spot.category, spot.tags || [], spot.name)
              };
            }
            return spot;
          });
        }
      }
      const raw = localStorage.getItem('blip_spots');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((spot) => {
          if (!spot.image) {
            return {
              ...spot,
              image: placesService.getPhotoForPlace(spot.category, spot.tags || [], spot.name)
            };
          }
          return spot;
        });
      }
      return SEED_SPOTS;
    } catch (e) {
      console.warn('Falling back to seed spots:', e);
      return SEED_SPOTS;
    }
  },

  // Save or update a spot locally
  async saveSpot(spot) {
    try {
      // Ensure spot has a photo
      if (!spot.image) {
        spot.image = placesService.getPhotoForPlace(spot.category, spot.tags || [], spot.name);
      }

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
