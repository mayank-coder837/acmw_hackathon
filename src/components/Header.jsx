import React from 'react';
import { Wifi, WifiOff, Search, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/seedSpots';

export default function Header({
  isOnline,
  toggleNetworkSimulation,
  user,
  onOpenProfile,
  onOpenWelcome,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange
}) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div
          className="brand-group"
          onClick={onOpenWelcome || (() => onSelectCategory('all'))}
          style={{ cursor: 'pointer' }}
          title="Click to view Welcome Tour"
        >
          <div className="brand-logo" style={{ background: 'transparent', padding: 0, overflow: 'visible' }}>
            <img src="/logo-neon.png" alt="Blip Logo" style={{ width: 32, height: 32, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.7))' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="brand-title">Blip</span>
              <span className="brand-tag">nearby now</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Network Simulator toggle */}
          <button
            className={`network-pill ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleNetworkSimulation}
            title={isOnline ? 'Click to simulate Offline mode' : 'Click to simulate Online mode'}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Live' : 'Offline'}</span>
          </button>

          {/* User Avatar Button */}
          <button
            className="avatar-btn"
            style={{ background: user?.avatarColor || 'var(--bg-surface)' }}
            onClick={onOpenProfile}
            title="View Profile & Sync Settings"
          >
            {user?.initials || 'ME'}
            <span className={`avatar-anon-dot ${user?.isAnonymous ? '' : 'linked'}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search nearby food, coffee, music, spots..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '36px', height: '36px', fontSize: '0.82rem', width: '100%' }}
        />
      </div>

      {/* Category Horizontal Filter Bar */}
      <div className="category-bar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
