import React, { useState } from 'react';
import { Bookmark, Sparkles, Filter } from 'lucide-react';
import SpotCard from './SpotCard';
import { CATEGORIES } from '../data/seedSpots';

export default function SavedListView({
  savedSpots,
  onToggleSave,
  onSelectSpot,
  userLocation,
  onGoToDiscover
}) {
  const [filterCategory, setFilterCategory] = useState('all');

  const filtered = savedSpots.filter((spot) => {
    if (filterCategory === 'all') return true;
    return spot.category === filterCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>My Saved Spots</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Fully cached locally — available anywhere, even with zero signal.
          </p>
        </div>
        <span className="brand-tag" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>
          {savedSpots.length} saved
        </span>
      </div>

      {/* Category filter within saved */}
      {savedSpots.length > 0 && (
        <div className="category-bar">
          {CATEGORIES.map((cat) => {
            const count = cat.id === 'all'
              ? savedSpots.length
              : savedSpots.filter((s) => s.category === cat.id).length;
            if (count === 0 && cat.id !== 'all') return null;

            return (
              <button
                key={cat.id}
                className={`category-chip ${filterCategory === cat.id ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat.id)}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* List or Empty State */}
      {filtered.length > 0 ? (
        <div className="spots-grid">
          {filtered.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              isSaved={true}
              onToggleSave={onToggleSave}
              onSelectSpot={onSelectSpot}
              userLocation={userLocation}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Bookmark size={32} />
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            {savedSpots.length === 0 ? 'No saved spots yet' : 'No spots in this category'}
          </h3>
          <p style={{ maxWidth: '320px', fontSize: '0.84rem' }}>
            Tap the bookmark icon on any spot in the Discover feed to keep it in your personal offline pocket guide.
          </p>
          {savedSpots.length === 0 && (
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', marginTop: '8px' }} onClick={onGoToDiscover}>
              <Sparkles size={16} />
              Explore Nearby Spots
            </button>
          )}
        </div>
      )}
    </div>
  );
}
