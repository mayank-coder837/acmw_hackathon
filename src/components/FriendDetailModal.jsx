import React from 'react';
import { X, Bookmark, Zap, MapPin, UserMinus, Calendar, ExternalLink } from 'lucide-react';
import { friendService } from '../services/friendService';
import SpotCard from './SpotCard';

export default function FriendDetailModal({
  friend,
  allSpots,
  userSavedSpotIds,
  onToggleSaveSpot,
  onSelectSpot,
  onPlanWithFriend,
  onRemoveFriend,
  onClose,
  userLocation
}) {
  if (!friend) return null;

  const friendSavedSpots = friendService.getFriendSavedSpots(friend, allSpots);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: '88vh' }}>
        <div className="modal-handle" />

        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="friend-avatar-lg"
              style={{ background: friend.avatarColor }}
            >
              {friend.initials || friend.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  {friend.displayName}
                </h2>
                <span className="brand-tag" style={{ background: 'rgba(6,182,212,0.15)', color: '#38bdf8', fontSize: '0.68rem', padding: '2px 8px' }}>
                  Friend
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {friend.handle || `@${friend.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Friend Bio & Stats */}
        {friend.bio && (
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 14px 0', lineHeight: 1.4 }}>
            {friend.bio}
          </p>
        )}

        <div className="friend-stats-bar">
          <div className="friend-stat-item">
            <span className="stat-val">{friendSavedSpots.length}</span>
            <span className="stat-lbl">Saved Spots</span>
          </div>
          <div className="friend-stat-divider" />
          <div className="friend-stat-item">
            <span className="stat-val">Active</span>
            <span className="stat-lbl">Discovery Circle</span>
          </div>
          <div className="friend-stat-divider" />
          <div className="friend-stat-item">
            <button
              type="button"
              className="btn-plan-friend-quick"
              onClick={() => {
                onClose();
                onPlanWithFriend(friend);
              }}
            >
              <Zap size={14} fill="#ffffff" />
              <span>⚡ Plan Outing</span>
            </button>
          </div>
        </div>

        {/* Friend's Saved Spots Section */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={15} color="#ec4899" />
              <span>{friend.displayName}’s Saved Spots ({friendSavedSpots.length})</span>
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Curated local favorites
            </span>
          </div>

          {friendSavedSpots.length > 0 ? (
            <div className="friend-spots-scroll">
              {friendSavedSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  isSaved={userSavedSpotIds.includes(spot.id)}
                  onToggleSave={onToggleSaveSpot}
                  onSelectSpot={(s) => {
                    onClose();
                    onSelectSpot(s);
                  }}
                  userLocation={userLocation}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '24px 12px' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {friend.displayName} hasn't bookmarked any spots yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-text-danger"
            onClick={() => {
              if (confirm(`Remove ${friend.displayName} from your friends?`)) {
                onRemoveFriend(friend.uid);
                onClose();
              }
            }}
          >
            <UserMinus size={14} />
            <span>Remove Friend</span>
          </button>

          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Added {new Date(friend.addedAt || Date.now()).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
