import React from 'react';
import { Radio, Wifi, WifiOff, Bookmark, PlusCircle, ArrowRight, UserPlus, Check, Clock } from 'lucide-react';

export default function LiveFeedView({
  activities,
  isOnline,
  currentUser,
  friends = [],
  requests = [],
  onSelectSpotById,
  onSendFriendRequest,
  onOpenFriendDetail
}) {
  const formatTime = (ts) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const getFriendStatus = (actUser) => {
    if (!actUser?.uid || !currentUser?.uid) return 'none';
    if (actUser.uid === currentUser.uid) return 'self';

    const isFriend = friends.some((f) => f.uid === actUser.uid);
    if (isFriend) return 'friend';

    const isPending = requests.some(
      (r) =>
        r.status === 'pending' &&
        ((r.fromUser?.uid === currentUser.uid && r.toUser?.uid === actUser.uid) ||
          (r.fromUser?.uid === actUser.uid && r.toUser?.uid === currentUser.uid))
    );
    if (isPending) return 'pending';

    return 'can_add';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Live Activity Feed</h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            Real-time discoveries and saves. Tap to add explorers to your circle!
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
            const friendStatus = getFriendStatus(act.user);
            const matchedFriend = friends.find((f) => f.uid === act.user?.uid);

            return (
              <div
                key={act.id}
                className="spot-card live-feed-card"
                style={{ padding: '12px 14px', alignItems: 'center', gap: '12px' }}
                onClick={() => onSelectSpotById(act.spot?.id || act.spotId)}
              >
                {/* User Avatar */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: act.user?.avatarColor || 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#ffffff',
                    flexShrink: 0,
                    cursor: friendStatus === 'friend' ? 'pointer' : 'default',
                    boxShadow: friendStatus === 'friend' ? '0 0 10px rgba(6,182,212,0.35)' : 'none'
                  }}
                  title={friendStatus === 'friend' ? 'View friend profile & saved spots' : act.user?.displayName}
                  onClick={(e) => {
                    if (friendStatus === 'friend' && matchedFriend && onOpenFriendDetail) {
                      e.stopPropagation();
                      onOpenFriendDetail(matchedFriend);
                    }
                  }}
                >
                  {act.user?.displayName?.substring(0, 2).toUpperCase() || 'EX'}
                </div>

                {/* Activity Content */}
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

                {/* Friend Action Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {friendStatus === 'can_add' && (
                    <button
                      type="button"
                      className="btn-feed-add-friend"
                      title="Send Friend Request"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendFriendRequest(act.user);
                      }}
                    >
                      <UserPlus size={13} />
                      <span>Add Friend</span>
                    </button>
                  )}

                  {friendStatus === 'pending' && (
                    <span className="feed-pending-tag">
                      <Clock size={11} />
                      <span>Pending</span>
                    </span>
                  )}

                  {friendStatus === 'friend' && (
                    <button
                      type="button"
                      className="feed-friend-tag"
                      title="View friends saved spots"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (matchedFriend && onOpenFriendDetail) {
                          onOpenFriendDetail(matchedFriend);
                        }
                      }}
                    >
                      <Check size={12} strokeWidth={2.5} />
                      <span>Friends</span>
                    </button>
                  )}

                  {friendStatus === 'self' && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                      You
                    </span>
                  )}

                  <ArrowRight size={15} color="var(--text-muted)" />
                </div>
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
            When nearby users bookmark spots or drop new blips, you'll see live pulses right here. Open another tab to test live sync and friend requests!
          </p>
        </div>
      )}
    </div>
  );
}
