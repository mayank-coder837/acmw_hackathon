// Places service for geolocation & OpenStreetMap Overpass queries

export const placesService = {
  // Get current browser position or return fallback
  async getCurrentPosition(fallbackCoords = { lat: 25.1972, lng: 55.2744 }) {
    if (!navigator.geolocation) {
      return { ...fallbackCoords, isFallback: true };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            isFallback: false
          });
        },
        (error) => {
          console.warn('Geolocation denied or timed out, using fallback city center:', error.message);
          resolve({ ...fallbackCoords, isFallback: true });
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
      );
    });
  },

  // Calculate distance between two lat/lng coordinates in km (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },

  // Format distance nicely: "350m" or "2.4 km"
  formatDistance(distKm) {
    if (distKm == null || isNaN(distKm)) return '';
    if (distKm < 1) {
      return `${Math.round(distKm * 1000)}m`;
    }
    return `${distKm.toFixed(1)} km`;
  },

  // Query live points of interest from OpenStreetMap Overpass API (online only)
  async fetchLiveOSMSpots(lat, lng, radiusMeters = 2000) {
    try {
      // Fast Overpass QL query for cafes, restaurants, bars, and viewpoints
      const query = `
        [out:json][timeout:10];
        (
          node["amenity"~"cafe|restaurant|fast_food|bar|pub"](around:${radiusMeters},${lat},${lng});
          node["tourism"~"attraction|viewpoint|gallery|artwork"](around:${radiusMeters},${lat},${lng});
        );
        out 12;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);
      const data = await response.json();

      if (!data.elements || data.elements.length === 0) return [];

      return data.elements.map((el, idx) => {
        const tags = el.tags || {};
        const name = tags.name || tags['name:en'] || 'Local Discovery';
        let category = 'food';
        let emoji = '🍴';

        if (tags.amenity === 'cafe') {
          category = 'coffee';
          emoji = '☕';
        } else if (tags.amenity === 'bar' || tags.amenity === 'pub') {
          category = 'fun';
          emoji = '🍸';
        } else if (tags.tourism === 'viewpoint' || tags.tourism === 'attraction' || tags.tourism === 'gallery') {
          category = 'culture';
          emoji = '🎨';
        }

        return {
          id: `osm-${el.id || idx}`,
          name,
          category,
          emoji,
          description: tags.description || tags.cuisine ? `Specialty: ${tags.cuisine || 'Local Fare'}` : 'Nearby discovery via OpenStreetMap community.',
          lat: el.lat,
          lng: el.lon,
          address: tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : 'Nearby Area',
          addedBy: 'OpenStreetMap Community',
          createdAt: Date.now() - 1000 * 60 * (idx * 15 + 10),
          saveCount: Math.floor(Math.random() * 25) + 3,
          tags: [category, tags.cuisine || 'Spot'].filter(Boolean),
          rating: (4.3 + Math.random() * 0.6).toFixed(1)
        };
      });
    } catch (e) {
      console.warn('Live Overpass fetch failed or offline, will rely on cached spots:', e.message);
      return [];
    }
  }
};
