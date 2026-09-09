import React, { useState, useEffect } from 'react';
import { X, PlusCircle, MapPin, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/seedSpots';

export default function AddSpotModal({ userLocation, user, onAddSpot, onClose }) {
  // Lock background scroll when modal is open
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.overflow = 'hidden';
    return () => {
      if (mainContent) mainContent.style.overflow = '';
    };
  }, []);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [emoji, setEmoji] = useState('📍');
  const [customTag, setCustomTag] = useState('');

  // Default coordinates to current user location with tiny jitter or city center
  const defaultLat = userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.006 : 25.1972;
  const defaultLng = userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.006 : 55.2744;

  const [lat, setLat] = useState(defaultLat.toFixed(5));
  const [lng, setLng] = useState(defaultLng.toFixed(5));

  const categoryEmojis = {
    food: '🍜',
    coffee: '☕',
    events: '🎵',
    fun: '🕹️',
    culture: '🎨'
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    setEmoji(categoryEmojis[catId] || '📍');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSpot = {
      id: `spot-${Date.now()}`,
      name: name.trim(),
      category,
      emoji: emoji || '📍',
      description: description.trim() || 'A new cool spot dropped by the community.',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: address.trim() || 'Nearby discovery',
      addedBy: user?.displayName || 'Anonymous Explorer',
      createdAt: Date.now(),
      saveCount: 1, // creator inherently saves
      tags: [category, customTag.trim()].filter(Boolean),
      rating: 5.0
    };

    onAddSpot(newSpot);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-logo" style={{ width: 28, height: 28 }}>
              <Sparkles size={14} color="#ffffff" />
            </div>
            <h2 className="modal-title">Drop a Blip</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Found a hidden gem? Pin it to the live map so nearby friends can discover and save it!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Spot Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kinoya Speakeasy Ramen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`category-chip ${category === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Emoji Icon</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.2rem' }}
                maxLength={2}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tag / Vibe</label>
              <input
                type="text"
                placeholder="e.g. Cozy, Rooftop, Jazz"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Description</label>
            <textarea
              placeholder="What makes this spot special? Why should people go?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Neighborhood / Address</label>
            <input
              type="text"
              placeholder="e.g. Alserkal Avenue, Warehouse 14"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8rem' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="form-input"
                style={{ fontSize: '0.8rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            <PlusCircle size={18} />
            Drop Blip to Live Map
          </button>
        </form>
      </div>
    </div>
  );
}
