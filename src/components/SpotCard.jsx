import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Star, MapPin } from 'lucide-react';
import { placesService } from '../services/placesService';
import { cn } from '../lib/utils';

export default function SpotCard({ spot, isSaved, onToggleSave, onSelectSpot, userLocation, isHighlighted }) {
  const distanceKm = userLocation ? placesService.calculateDistance(
    userLocation.lat,
    userLocation.lng,
    spot.lat,
    spot.lng
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "spot-card transition-colors duration-200",
        isHighlighted && "highlight-pulse"
      )}
      onClick={() => onSelectSpot(spot)}
    >
      <div className="spot-emoji-box">
        {spot.emoji || '📍'}
      </div>

      <div className="spot-info">
        <div className="spot-header">
          <h3 className="spot-name">{spot.name}</h3>
          <motion.button
            whileTap={{ scale: 0.8 }}
            className={cn("save-btn", isSaved && "saved")}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(spot);
            }}
            title={isSaved ? 'Remove from Saved' : 'Save to My Spots'}
          >
            <Bookmark size={13} fill={isSaved ? '#f87171' : 'none'} />
            <span>{spot.saveCount || 0}</span>
          </motion.button>
        </div>

        <div className="spot-meta">
          <span className="spot-badge">{spot.category}</span>
          {distanceKm != null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={11} />
              {placesService.formatDistance(distanceKm)}
            </span>
          )}
          {spot.rating && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
              <Star size={11} fill="#fbbf24" />
              {spot.rating}
            </span>
          )}
        </div>

        {spot.description && (
          <p className="spot-desc">{spot.description}</p>
        )}

        <div className="spot-social-footer">
          <span>Added by <span className="activity-user">{spot.addedBy || 'Explorer'}</span></span>
          {spot.tags && spot.tags.length > 0 && (
            <span>#{spot.tags[0]}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
