import React, { useState } from 'react';
import { X, Zap, Calendar, Clock, MessageSquare, Users, Check, Sparkles } from 'lucide-react';
import { friendService } from '../services/friendService';
import { syncService } from '../services/syncService';

const TIME_PRESETS = [
  'Tonight at 8:00 PM',
  'Tonight at 9:30 PM',
  'Tomorrow at 2:00 PM',
  'Tomorrow at 7:00 PM',
  'This Saturday at 6:00 PM'
];

export default function PlanPlaceModal({
  spot,
  user,
  friends,
  preselectedFriendUid,
  onClose,
  onPlanCreated,
  onOpenFriendsTab
}) {
  const [selectedFriendUids, setSelectedFriendUids] = useState(() => {
    if (preselectedFriendUid) return [preselectedFriendUid];
    // Default to first friend if available
    return friends.length > 0 ? [friends[0].uid] : [];
  });
  const [selectedTime, setSelectedTime] = useState(TIME_PRESETS[0]);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState('');
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggleFriend = (uid) => {
    setSelectedFriendUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSelectAllFriends = () => {
    if (selectedFriendUids.length === friends.length) {
      setSelectedFriendUids([]);
    } else {
      setSelectedFriendUids(friends.map((f) => f.uid));
    }
  };

  const handleSendInvite = () => {
    if (!spot || selectedFriendUids.length === 0) return;
    setIsSending(true);

    const chosenFriends = friends.filter((f) => selectedFriendUids.includes(f.uid));
    const finalTime = isCustomTime && customTimeValue.trim() ? customTimeValue.trim() : selectedTime;

    const plan = friendService.createPlan(user, {
      spot,
      invitedFriends: chosenFriends,
      dateTime: finalTime,
      note: note.trim() || 'Let’s meet up at this spot! ⚡'
    });

    // Broadcast in real-time across tabs/network
    syncService.broadcastBlipInvite(plan);

    // Play local buzz confirmation
    friendService.playBlipBuzzEffect();

    setTimeout(() => {
      setIsSending(false);
      if (onPlanCreated) onPlanCreated(plan);
      onClose();
    }, 450);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-handle" />

        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(245,158,11,0.2))',
                border: '1px solid rgba(6,182,212,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Plan Spot with Friends
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                Send a real-time buzz invite to your circle
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Selected Spot Banner */}
        <div className="plan-spot-banner">
          <span style={{ fontSize: '2rem' }}>{spot.emoji || '📍'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="spot-badge" style={{ textTransform: 'capitalize' }}>
              {spot.category}
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '2px 0 0 0' }}>
              {spot.name}
            </h3>
            {spot.address && (
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
                {spot.address}
              </p>
            )}
          </div>
        </div>

        {/* 1. Pick Friends */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="#38bdf8" />
              <span>Select Friends to Blip ({selectedFriendUids.length}/{friends.length})</span>
            </label>
            {friends.length > 1 && (
              <button
                type="button"
                onClick={handleSelectAllFriends}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {selectedFriendUids.length === friends.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {friends.length > 0 ? (
            <div className="plan-friends-picker">
              {friends.map((friend) => {
                const isSelected = selectedFriendUids.includes(friend.uid);
                return (
                  <div
                    key={friend.uid}
                    className={`plan-friend-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleFriend(friend.uid)}
                  >
                    <div
                      className="friend-avatar-sm"
                      style={{ background: friend.avatarColor }}
                    >
                      {friend.initials || friend.displayName.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="friend-chip-name">{friend.displayName}</div>
                      <div className="friend-chip-handle">{friend.handle}</div>
                    </div>
                    <div className={`friend-check-bubble ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-friends-box">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                You haven't added any friends yet. Add peers from the Live Feed to blip them!
              </p>
              {onOpenFriendsTab && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 8, padding: '6px 12px', fontSize: '0.76rem' }}
                  onClick={() => {
                    onClose();
                    onOpenFriendsTab();
                  }}
                >
                  Go to Friends Hub
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Choose Time */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Clock size={14} color="#f59e0b" />
            <span>When are you going?</span>
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`category-chip ${!isCustomTime && selectedTime === preset ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                onClick={() => {
                  setIsCustomTime(false);
                  setSelectedTime(preset);
                }}
              >
                {preset}
              </button>
            ))}
            <button
              type="button"
              className={`category-chip ${isCustomTime ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.76rem' }}
              onClick={() => setIsCustomTime(true)}
            >
              Custom...
            </button>
          </div>

          {isCustomTime && (
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Friday at 9:00 PM, Sunday brunch..."
              value={customTimeValue}
              onChange={(e) => setCustomTimeValue(e.target.value)}
              style={{ fontSize: '0.84rem' }}
              autoFocus
            />
          )}
        </div>

        {/* 3. Note / Vibe message */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MessageSquare size={14} color="#34d399" />
            <span>Add a Note or Vibe (Optional)</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Their iced pour-over is insane, let’s sit outside!"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ fontSize: '0.84rem' }}
          />
        </div>

        {/* Action Button */}
        <button
          className="btn-primary blip-send-btn"
          disabled={selectedFriendUids.length === 0 || isSending}
          onClick={handleSendInvite}
        >
          <Zap size={18} fill="#ffffff" />
          <span>
            {isSending
              ? 'Bliping Friends...'
              : `⚡ Send Blip Invite (${selectedFriendUids.length} ${selectedFriendUids.length === 1 ? 'Friend' : 'Friends'})`}
          </span>
        </button>
      </div>
    </div>
  );
}
