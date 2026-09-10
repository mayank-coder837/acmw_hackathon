import React from 'react';
import { Compass, Sparkles, MapPin, Radio } from 'lucide-react';
import { Ripple } from './ui/Ripple';

export default function RadarHero({ activeSpotsCount, cityName, isOnline, onViewMap, viewMode }) {
  return (
    <div className="radar-hero-card">
      {/* 21st.dev Animated Sonar Ripple Waves */}
      <Ripple numCircles={4} mainCircleSize={110} className="opacity-70" />

      {/* Top row: Status badges */}
      <div className="radar-hero-top">
        <div className="radar-status-badge">
          <span className={`radar-pulse-dot ${isOnline ? '' : 'offline'}`} />
          <span>{isOnline ? 'Active Sonar Sweep' : 'Offline Cache Mode'}</span>
        </div>

        <div className="radar-blip-count">
          <Sparkles size={12} color="#06b6d4" />
          <span>{activeSpotsCount} Nearby Blips</span>
        </div>
      </div>

      {/* Main hero bottom row */}
      <div className="radar-hero-bottom">
        <div>
          <div className="radar-hero-title">
            <span>Blip Now</span>
            <span className="radar-live-pill">Live Radar</span>
          </div>
          <div className="radar-hero-subtitle">
            <MapPin size={12} color="#06b6d4" />
            <span>Scanning 2.5km around <strong>{cityName}</strong></span>
          </div>
        </div>

        <button className="radar-toggle-btn" onClick={onViewMap}>
          <Compass size={14} />
          <span>{viewMode === 'map' ? 'Show List' : 'Open Map'}</span>
        </button>
      </div>
    </div>
  );
}
