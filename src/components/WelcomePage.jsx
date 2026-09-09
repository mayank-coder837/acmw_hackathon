import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Wifi,
  WifiOff,
  Radio,
  MapPin,
  Bookmark,
  Users,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { CITY_PRESETS } from '../data/seedSpots';

export default function WelcomePage({ onEnterApp, selectedCity, onSelectCity, onOpenAuth, user }) {
  const [activeCity, setActiveCity] = useState(selectedCity || 'Downtown Dubai');

  const handleCityPick = (cityName) => {
    setActiveCity(cityName);
    if (onSelectCity) {
      onSelectCity(cityName);
    }
  };

  const handleStart = () => {
    onEnterApp(activeCity);
  };

  return (
    <div className="welcome-container">
      {/* Background Ambient Neon Glows */}
      <div className="welcome-glow welcome-glow-1" />
      <div className="welcome-glow welcome-glow-2" />
      <div className="welcome-glow welcome-glow-3" />

      {/* Top Bar Navigation */}
      <header className="welcome-header">
        <div className="brand-group">
          <div className="brand-logo" style={{ background: 'transparent', padding: 0, overflow: 'visible' }}>
            <img src="/logo-blue.png" alt="Blip Logo" style={{ width: 32, height: 32, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(6,182,212,0.9))' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="brand-title">Blip</span>
              <span className="brand-tag">nearby now</span>
            </div>
          </div>
        </div>

        <button
          className="welcome-skip-btn"
          onClick={handleStart}
          title="Skip directly to the live discovery feed"
        >
          <span>Skip to Map</span>
          <ArrowRight size={13} />
        </button>

      </header>

      {/* Scrollable Welcome Content */}
      <div className="welcome-content no-scrollbar">
        {/* Radar Sonar Hero Visual */}
        <div className="welcome-hero-section">
          <div className="welcome-sonar-stage">
            {/* Pulsing Concentric Radar Rings */}
            <div className="welcome-sonar-ring ring-1" />
            <div className="welcome-sonar-ring ring-2" />
            <div className="welcome-sonar-ring ring-3" />
            <div className="welcome-sonar-ring ring-4" />

            {/* Rotating Radar Sweep Beam */}
            <div className="welcome-radar-sweep" />

            {/* Central Radar Hub */}
            <div className="welcome-sonar-core">
              <Compass size={28} className="text-cyan-300 animate-spin-slow" />
              <div className="welcome-sonar-pulse-dot" />
            </div>

            {/* Floating Live Blip Badges */}
            <div className="floating-blip blip-food">
              <span className="floating-emoji">🍜</span>
              <span className="floating-label">Tonkotsu Ramen • 0.4km</span>
            </div>

            <div className="floating-blip blip-coffee">
              <span className="floating-emoji">☕</span>
              <span className="floating-label">Single Origin • 0.8km</span>
            </div>

            <div className="floating-blip blip-event">
              <span className="floating-emoji">🎵</span>
              <span className="floating-label">Vinyl Sessions • 1.2km</span>
            </div>

            <div className="floating-blip blip-art">
              <span className="floating-emoji">🎨</span>
              <span className="floating-label">Design Loft • 1.5km</span>
            </div>
          </div>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="welcome-text-section">
          <div className="welcome-badge">
            <Radio size={12} className="text-cyan-400 animate-pulse" />
            <span>Real-Time Local Sonar</span>
          </div>

          <h1 className="welcome-title">
            Discover What's Happening <br />
            <span className="welcome-gradient-text">Nearby, Right Now.</span>
          </h1>

          <p className="welcome-description">
            Instant discovery for hidden cafes, pop-up events, and street food.
            Engineered <strong>100% offline-resilient</strong> so your map and bookmarks never go dark, even with zero signal.
          </p>
        </div>

        {/* City Location Hub Picker */}
        <div className="welcome-city-section">
          <div className="welcome-city-header">
            <MapPin size={13} className="text-cyan-400" />
            <span>Choose Your Starting Radar Hub:</span>
          </div>
          <div className="welcome-city-grid">
            {CITY_PRESETS.map((city) => (
              <button
                key={city.name}
                type="button"
                className={`welcome-city-chip ${activeCity === city.name ? 'active' : ''}`}
                onClick={() => handleCityPick(city.name)}
              >
                <span>{city.name}</span>
                {activeCity === city.name && <span className="city-active-indicator" />}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="welcome-features-grid">
          {/* Feature 1: Offline */}
          <div className="welcome-feature-card card-offline">
            <div className="feature-icon-wrap icon-cyan">
              <Zap size={20} />
            </div>
            <div className="feature-body">
              <div className="feature-heading">
                <h3>100% Offline-First</h3>
                <span className="feature-badge">Zero Signal</span>
              </div>
              <p>
                Browse cached spots, view detailed addresses, and check your saved list anytime without needing cellular data.
              </p>
            </div>
          </div>

          {/* Feature 2: Sonar */}
          <div className="welcome-feature-card card-radar">
            <div className="feature-icon-wrap icon-blue">
              <Compass size={20} />
            </div>
            <div className="feature-body">
              <div className="feature-heading">
                <h3>2.5km Sonar Radar</h3>
                <span className="feature-badge">Interactive Map</span>
              </div>
              <p>
                Switch between high-contrast CartoDB dark maps and curated cards to track walking distance and ratings.
              </p>
            </div>
          </div>

          {/* Feature 3: Sync & Drop */}
          <div className="welcome-feature-card card-sync">
            <div className="feature-icon-wrap icon-purple">
              <Users size={20} />
            </div>
            <div className="feature-body">
              <div className="feature-heading">
                <h3>Real-Time Peer Sync</h3>
                <span className="feature-badge">Zero Friction</span>
              </div>
              <p>
                Drop a blip to share hidden gems instantly with peers. Silent anonymous identity created automatically on open.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Launch Section */}
        <div className="welcome-cta-container">
          <button
            type="button"
            className="welcome-main-btn"
            onClick={handleStart}
          >
            <span className="btn-glow" />
            <span className="btn-text">
              <Sparkles size={18} />
              <span>Launch Radar & Explore</span>
              <ArrowRight size={18} />
            </span>
          </button>

          {/* Trust badges footer */}
          <div className="welcome-trust-row">
            <div className="trust-item">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>{user && !user.isAnonymous ? `Hi, ${user.displayName}` : 'Free Account Available'}</span>
            </div>
            <span className="trust-dot">•</span>
            <div className="trust-item">
              <WifiOff size={12} className="text-cyan-400" />
              <span>Offline Ready</span>
            </div>
            <span className="trust-dot">•</span>
            <div className="trust-item">
              <Bookmark size={12} className="text-purple-400" />
              <span>Instant Bookmarks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
