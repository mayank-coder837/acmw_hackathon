import React, { useEffect } from 'react';
import { X, Bookmark, Navigation, Share2, Star, Clock, User, Tag, Zap } from 'lucide-react';
import { placesService } from '../services/placesService';

export default function SpotDetailModal({
  spot,
  isSaved,
  onToggleSave,
  onClose,
  userLocation,
  onPlanSpot
}) {
  // Lock background scroll when modal is open
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.overflow = 'hidden';
    return () => {
      if (mainContent) mainContent.style.overflow = '';
    };
  }, []);

  if (!spot) return null;

  const distanceKm = userLocation
    ? placesService.calculateDistance(userLocation.lat, userLocation.lng, spot.lat, spot.lng)
    : null;

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `blip: ${spot.name}`,
        text: `Check out ${spot.name} on blip! ${spot.description}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${spot.name} - ${spot.description} (Found on blip)`);
      alert('Copied spot details to clipboard!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '2rem' }}>{spot.emoji || '📍'}</span>
            <div>
              <span className="spot-badge" style={{ textTransform: 'capitalize' }}>
                {spot.category}
              </span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
          {spot.name}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {spot.rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontWeight: 700 }}>
              <Star size={13} fill="#fbbf24" /> {spot.rating}
            </span>
          )}
          {distanceKm != null && (
            <span>📍 {placesService.formatDistance(distanceKm)} away</span>
          )}
          <span>❤️ {spot.saveCount || 0} saves</span>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '18px' }}>
          {spot.description}
        </p>

        {spot.address && (
          <div style={{ background: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong>Location:</strong> {spot.address}
          </div>
        )}

        {spot.tags && spot.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {spot.tags.map((tag, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', fontSize: '0.72rem', padding: '4px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={12} /> Added by <strong style={{ color: '#38bdf8' }}>{spot.addedBy || 'Explorer'}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> {new Date(spot.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className={`btn-primary`}
            style={{
              background: isSaved ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)'
            }}
            onClick={() => onToggleSave(spot)}
          >
            <Bookmark size={18} fill={isSaved ? '#ffffff' : 'none'} />
            {isSaved ? 'Remove from Saved' : 'Save to My Spots'}
          </button>

          <button
            type="button"
            className="btn-primary blip-plan-btn"
            onClick={() => {
              if (onPlanSpot) onPlanSpot(spot);
            }}
          >
            <Zap size={18} fill="#ffffff" />
            <span>⚡ Plan with Friends (Blip)</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button className="btn-secondary" onClick={handleDirections}>
              <Navigation size={16} />
              Directions
            </button>
            <button className="btn-secondary" onClick={handleShare}>
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
