import React from 'react';
import { Radio, Wifi, WifiOff, Bookmark, PlusCircle, ArrowRight } from 'lucide-react';

export default function LiveFeedView({ activities, isOnline, onSelectSpotById }) {
  const formatTime = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Live Activity Feed</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Real-time discoveries and saves from friends & nearby explorers.
          </p>
        </div>

        <div className={`network-pill ${isOnline ? 'online' : 'offline'}`} style={{ cursor: 'default' }}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isOnline ? 'Live Stream' : 'Paused (Offline)'}</span>
        </div>
      </div>

      {!isOnline && (
        <div className="offline-banner">
          <span>Feed paused while offline. Activity will resume automatically when signal returns.</span>
        </div>
      )}

      {activities.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.map((act) => {
            const isNew = act.type === 'NEW_SPOT';
            return (
              <div
                key={act.id}
                className="spot-card"
                style={{ padding: '12px 14px', alignItems: 'center', gap: '12px' }}
                onClick={() => onSelectSpotById(act.spot?.id || act.spotId)}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: act.user?.avatarColor || 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    flexShrink: 0
                  }}
                >
                  {act.user?.displayName?.substring(0, 2).toUpperCase() || 'EX'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    <strong style={{ color: '#38bdf8' }}>{act.user?.displayName || 'Explorer'}</strong>{' '}
                    {isNew ? (
                      <span style={{ color: '#34d399' }}>dropped a new blip:</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>just saved:</span>
                    )}{' '}
                    <strong>{act.spot?.name}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{act.spot?.emoji || '📍'} {act.spot?.category}</span>
                    <span>•</span>
                    <span>{formatTime(act.timestamp)}</span>
                  </div>
                </div>

                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Radio size={32} />
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>Listening for nearby activity...</h3>
          <p style={{ maxWidth: '320px', fontSize: '0.84rem' }}>
            When nearby users bookmark spots or drop new blips, you'll see live pulses right here. Open another tab to test live sync!
          </p>
        </div>
      )}
    </div>
  );
}
