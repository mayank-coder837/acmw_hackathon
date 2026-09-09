import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Star, MapPin, Flame } from 'lucide-react';
import { placesService } from '../services/placesService';
import { cn } from '../lib/utils';
import { BorderBeam } from './ui/BorderBeam';

export default function SpotCard({ spot, isSaved, onToggleSave, onSelectSpot, userLocation, isHighlighted }) {
  const distanceKm = userLocation ? placesService.calculateDistance(
    userLocation.lat,
    userLocation.lng,
    spot.lat,
    spot.lng
  ) : null;

  const isTrending = (spot.saveCount || 0) >= 25;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "spot-card relative overflow-hidden transition-colors duration-200",
        isHighlighted && "highlight-pulse",
        isTrending && "border-cyan-500/40"
      )}
      onClick={() => onSelectSpot(spot)}
    >
      {/* 21st.dev Border Beam on Highlighted or Trending spots */}
      {(isHighlighted || isTrending) && (
        <BorderBeam
          duration={isHighlighted ? 3.5 : 7}
          colorFrom={isHighlighted ? "#10b981" : "#06b6d4"}
          colorTo={isHighlighted ? "#06b6d4" : "#8b5cf6"}
          colorMid="#38bdf8"
        />
      )}

      <div className="spot-emoji-box relative z-10">
        {spot.emoji || '📍'}
      </div>

      <div className="spot-info relative z-10">
        <div className="spot-header">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="spot-name">{spot.name}</h3>
            {isTrending && (
              <span className="flex items-center gap-0.5 text-[0.65rem] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full shrink-0">
                <Flame size={10} className="fill-amber-400" /> Hot
              </span>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.8 }}
            className={cn("save-btn shrink-0", isSaved && "saved")}
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
