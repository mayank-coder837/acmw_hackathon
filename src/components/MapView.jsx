import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapView({ spots, userLocation, selectedSpot, onSelectSpot, highlightedSpotId }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const initialLat = userLocation?.lat || 25.1972;
    const initialLng = userLocation?.lng || 55.2744;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false
    });

    // Add free OpenStreetMap tiles (no API key required) with dark CSS styling
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    const userIcon = L.divIcon({
      className: 'user-pulse-pin-wrap',
      html: `<div class="user-pulse-pin"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000
      })
        .addTo(map)
        .bindPopup(`<b>You are here</b><br/>Scanning nearby blips...`);
    }

    map.panTo([userLocation.lat, userLocation.lng]);
  }, [userLocation]);

  // Update Spot Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    spots.forEach((spot) => {
      const isHighlighted = highlightedSpotId === spot.id;
      const isSelected = selectedSpot?.id === spot.id;

      const spotIcon = L.divIcon({
        className: 'custom-pin-wrap',
        html: `
          <div class="custom-pin" style="${isHighlighted || isSelected ? 'border-color: #38bdf8; box-shadow: 0 0 20px #38bdf8; transform: scale(1.25);' : ''}">
            ${spot.emoji || '📍'}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: spotIcon }).addTo(map);

      marker.on('click', () => {
        onSelectSpot(spot);
      });

      markersRef.current[spot.id] = marker;
    });
  }, [spots, selectedSpot, highlightedSpotId]);

  return (
    <div className="map-view-wrapper">
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
}
