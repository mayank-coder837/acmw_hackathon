import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Plus, Minus, Crosshair, Layers, Satellite, Sparkles } from 'lucide-react';

const CATEGORY_COLORS = {
  food: { color: '#f97316', glow: 'rgba(249, 115, 22, 0.6)' },
  coffee: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' },
  events: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
  fun: { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' },
  culture: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
  default: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' }
};

export default function MapView({ spots, userLocation, selectedSpot, onSelectSpot, highlightedSpotId }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayersRef = useRef({});
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const radarCircleRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('dark'); // 'dark' | 'satellite'

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = userLocation?.lat || 25.1972;
    const initialLng = userLocation?.lng || 55.2744;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false // custom attribution
    });

    // Sleek Esri Dark Canvas Base
    const darkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      subdomains: ['server', 'services']
    });

    // Crisp Vector Labels Layer
    const darkLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      subdomains: ['server', 'services'],
      zIndex: 500
    });

    const darkGroup = L.layerGroup([darkBase, darkLabels]);

    // High-Resolution Satellite Layer
    const satelliteBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      subdomains: ['server', 'services']
    });

    tileLayersRef.current = {
      dark: darkGroup,
      satellite: satelliteBase
    };

    // Add default dark group
    darkGroup.addTo(map);

    // Minimal dark attribution
    L.control.attribution({
      position: 'bottomright',
      prefix: '<span>Blip Radar &copy; Esri & OpenStreetMap</span>'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Map Style Switch (Dark Minimalist vs Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { dark, satellite } = tileLayersRef.current;
    if (!dark || !satellite) return;

    if (mapStyle === 'dark') {
      map.removeLayer(satellite);
      map.addLayer(dark);
    } else {
      map.removeLayer(dark);
      map.addLayer(satellite);
    }
  }, [mapStyle]);

  // 3. User Location Radar Marker & Scanning Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    const userIcon = L.divIcon({
      className: 'user-radar-pin-container',
      html: `
        <div class="user-radar-wrapper">
          <div class="user-radar-dot"></div>
          <div class="user-radar-sonar-1"></div>
          <div class="user-radar-sonar-2"></div>
        </div>
      `,
      iconSize: [80, 80],
      iconAnchor: [40, 40]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      }).addTo(map);
    }

    // Animated scan circle around user (500m radius)
    if (radarCircleRef.current) {
      radarCircleRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      radarCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: 650,
        color: '#06b6d4',
        weight: 1.5,
        dashArray: '4 8',
        fillColor: '#06b6d4',
        fillOpacity: 0.05,
        interactive: false
      }).addTo(map);
    }

    map.panTo([userLocation.lat, userLocation.lng], { animate: true, duration: 0.8 });
  }, [userLocation]);

  // 4. Update Modern Spot Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Group close coordinates slightly so pins don't overlap completely
    const coordinateCounts = {};

    spots.forEach((spot) => {
      const coordKey = `${spot.lat.toFixed(4)}_${spot.lng.toFixed(4)}`;
      const count = coordinateCounts[coordKey] || 0;
      coordinateCounts[coordKey] = count + 1;

      // Small jitter if multiple pins share identical coordinate
      const offsetLat = count > 0 ? (count * 0.0006 * Math.sin(count * 2)) : 0;
      const offsetLng = count > 0 ? (count * 0.0006 * Math.cos(count * 2)) : 0;
      const actualLat = spot.lat + offsetLat;
      const actualLng = spot.lng + offsetLng;

      const isHighlighted = highlightedSpotId === spot.id;
      const isSelected = selectedSpot?.id === spot.id;
      const categoryStyle = CATEGORY_COLORS[spot.category] || CATEGORY_COLORS.default;

      const spotIcon = L.divIcon({
        className: 'modern-pin-container',
        html: `
          <div 
            class="modern-map-pin ${isSelected ? 'is-selected' : ''}" 
            style="--pin-color: ${categoryStyle.color}; --pin-glow: ${categoryStyle.glow};"
          >
            ${isSelected || isHighlighted ? '<div class="modern-pin-pulse"></div>' : ''}
            <div class="modern-pin-badge">
              <span>${spot.emoji || '📍'}</span>
            </div>
          </div>
        `,
        iconSize: [42, 48],
        iconAnchor: [21, 46]
      });

      const marker = L.marker([actualLat, actualLng], {
        icon: spotIcon,
        zIndexOffset: isSelected ? 900 : isHighlighted ? 800 : 100
      }).addTo(map);

      marker.on('click', () => {
        onSelectSpot(spot);
      });

      markersRef.current[spot.id] = marker;
    });
  }, [spots, selectedSpot, highlightedSpotId]);

  // Handle Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 1.2
      });
    }
  };

  const handleToggleLayer = () => {
    setMapStyle((prev) => (prev === 'dark' ? 'satellite' : 'dark'));
  };

  return (
    <div className="map-view-wrapper">
      <div ref={mapContainerRef} className="map-container" />

      {/* Floating Modern Glass Controls */}
      <div className="map-floating-controls">
        <button
          className="map-glass-btn"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <Plus size={18} />
        </button>

        <button
          className="map-glass-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <Minus size={18} />
        </button>

        <button
          className="map-glass-btn"
          onClick={handleRecenter}
          title="Center on My Location"
        >
          <Crosshair size={18} color="#06b6d4" />
        </button>

        <button
          className={`map-glass-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
          onClick={handleToggleLayer}
          title={mapStyle === 'dark' ? 'Switch to Satellite View' : 'Switch to Dark Canvas'}
        >
          {mapStyle === 'dark' ? <Satellite size={18} /> : <Layers size={18} />}
        </button>
      </div>
    </div>
  );
}
