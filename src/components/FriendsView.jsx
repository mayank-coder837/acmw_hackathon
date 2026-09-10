import React, { useState } from 'react';
import { Users, UserPlus, Clock, Zap, Check, X, Calendar, MapPin, ArrowRight, Bookmark, Search, MessageSquare } from 'lucide-react';
import { friendService } from '../services/friendService';

export default function FriendsView({
  friends,
  requests,
  plans,
  user,
  allSpots,
  onOpenFriendDetail,
  onOpenPlanModalWithFriend,
  onAcceptRequest,
  onDeclineRequest,
  onCancelRequest,
  onSendFriendRequestByName,
  onSelectSpotById,
  onGoToDiscover
}) {
  const [subTab, setSubTab] = useState('friends'); // 'friends' | 'requests' | 'plans'
  const [searchHandle, setSearchHandle] = useState('');
  const [addFeedback, setAddFeedback] = useState(null);

  const incomingRequests = requests.filter(
    (r) => r.status === 'pending' && r.toUser?.uid === user.uid
  );
  const outgoingRequests = requests.filter(
    (r) => r.status === 'pending' && r.fromUser?.uid === user.uid
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!searchHandle.trim()) return;

    const result = onSendFriendRequestByName(searchHandle.trim());
    if (result?.error) {
      setAddFeedback({ type: 'error', message: result.error });
    } else {
      setAddFeedback({ type: 'success', message: `Friend request sent to ${searchHandle}!` });
      setSearchHandle('');
    }
    setTimeout(() => setAddFeedback(null), 4000);
  };

  return (
    <div className="friends-view-container">
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
            Friends Hub & Outings
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            Connect, browse your friends' saved spots, and plan hangouts.
          </p>
        </div>
        <div className="brand-tag" style={{ background: 'rgba(6,182,212,0.15)', color: '#38bdf8', borderColor: 'rgba(6,182,212,0.3)' }}>
          {friends.length} Friends
        </div>
      </div>

      {/* Add Friend Search Input */}
      <form onSubmit={handleAddSubmit} className="friend-search-form">
        <div className="friend-search-input-wrap">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Add friend by @handle or name..."
            value={searchHandle}
            onChange={(e) => setSearchHandle(e.target.value)}
          />
          <button type="submit" className="btn-add-friend-submit">
            <UserPlus size={14} />
            <span>Send Request</span>
          </button>
        </div>
        {addFeedback && (
          <div className={`friend-add-feedback ${addFeedback.type}`}>
            {addFeedback.message}
          </div>
        )}
      </form>

      {/* Sub-Navigation Tabs */}
      <div className="friends-segment-bar">
        <button
          className={`friends-segment-btn ${subTab === 'friends' ? 'active' : ''}`}
          onClick={() => setSubTab('friends')}
        >
          <Users size={14} />
          <span>Friends ({friends.length})</span>
        </button>

        <button
          className={`friends-segment-btn ${subTab === 'requests' ? 'active' : ''}`}
          onClick={() => setSubTab('requests')}
        >
          <UserPlus size={14} />
          <span>Requests</span>
          {incomingRequests.length > 0 && (
            <span className="friends-badge-alert">{incomingRequests.length}</span>
          )}
        </button>

        <button
          className={`friends-segment-btn ${subTab === 'plans' ? 'active' : ''}`}
          onClick={() => setSubTab('plans')}
        >
          <Zap size={14} />
          <span>Planned Outings ({plans.length})</span>
        </button>
      </div>

      {/* Sub-tab 1: Friends List */}
      {subTab === 'friends' && (
        <div className="friends-list-wrapper">
          {friends.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {friends.map((friend) => {
                const savedSpotsCount = (friend.savedSpotIds || []).length;

                return (
                  <div
                    key={friend.uid}
                    className="friend-row-card"
                    onClick={() => onOpenFriendDetail(friend)}
                  >
                    <div
                      className="friend-avatar-md"
                      style={{ background: friend.avatarColor }}
                    >
                      {friend.initials || friend.displayName.substring(0, 2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 className="friend-card-name">{friend.displayName}</h4>
                        <span className="friend-saved-pill">
                          <Bookmark size={10} color="#ec4899" fill="#ec4899" />
                          <span>{savedSpotsCount} saved spots</span>
                        </span>
                      </div>
                      <div className="friend-card-handle">
                        {friend.handle || `@${friend.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                      </div>
                      {friend.bio && (
                        <p className="friend-card-bio">{friend.bio}</p>
                      )}
                    </div>

                    {/* Quick action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-friend-plan-action"
                        title="Plan a place with this friend"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPlanModalWithFriend(friend);
                        }}
                      >
                        <Zap size={14} />
                        <span>Blip</span>
                      </button>

                      <button
                        type="button"
                        className="btn-friend-spots-action"
                        title="View their saved spots"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenFriendDetail(friend);
                        }}
                      >
                        <Bookmark size={13} />
                        <span>Spots</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Users size={32} />
              </div>
              <h3>No friends connected yet</h3>
              <p>Explore the Live Feed or use the search bar above to invite your fellow explorers!</p>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Requests */}
      {subTab === 'requests' && (
        <div className="friends-requests-wrapper">
          {/* Incoming Requests */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Incoming Requests ({incomingRequests.length})
            </h3>
            {incomingRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {incomingRequests.map((req) => (
                  <div key={req.id} className="request-row-card">
                    <div
                      className="friend-avatar-md"
                      style={{ background: req.fromUser?.avatarColor }}
                    >
                      {req.fromUser?.initials || req.fromUser?.displayName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 className="friend-card-name">{req.fromUser?.displayName}</h4>
                      <span className="friend-card-handle">{req.fromUser?.handle}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-req-accept"
                        onClick={() => onAcceptRequest(req.id)}
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        className="btn-req-decline"
                        onClick={() => onDeclineRequest(req.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No incoming friend requests.</p>
            )}
          </div>

          {/* Outgoing Requests */}
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Sent Requests ({outgoingRequests.length})
            </h3>
            {outgoingRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {outgoingRequests.map((req) => (
                  <div key={req.id} className="request-row-card">
                    <div
                      className="friend-avatar-md"
                      style={{ background: req.toUser?.avatarColor }}
                    >
                      {req.toUser?.initials || req.toUser?.displayName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 className="friend-card-name">{req.toUser?.displayName}</h4>
                      <span className="friend-card-handle">{req.toUser?.handle}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-req-cancel"
                      onClick={() => onCancelRequest(req.id)}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No pending sent requests.</p>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Planned Hangouts */}
      {subTab === 'plans' && (
        <div className="friends-plans-wrapper">
          {plans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="plan-card-item"
                  onClick={() => onSelectSpotById(plan.spotId)}
                >
                  <div className="plan-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.8rem' }}>{plan.spotEmoji || '📍'}</span>
                      <div>
                        <span className="spot-badge" style={{ textTransform: 'capitalize' }}>
                          {plan.spotCategory}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '2px 0 0 0' }}>
                          {plan.spotName}
                        </h4>
                      </div>
                    </div>

                    <div className="plan-status-pill accepted">
                      <Zap size={11} fill="#38bdf8" />
                      <span>{plan.status === 'accepted' ? 'Confirmed' : 'Invited'}</span>
                    </div>
                  </div>

                  <div className="plan-card-middle">
                    <div className="plan-meta-row">
                      <Clock size={13} color="#f59e0b" />
                      <span>{plan.dateTime}</span>
                    </div>

                    {plan.note && (
                      <div className="plan-note-preview">
                        <MessageSquare size={12} color="#38bdf8" />
                        <span>"{plan.note}"</span>
                      </div>
                    )}
                  </div>

                  <div className="plan-card-bottom">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Invited:</span>
                      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 4 }}>
                        {plan.creator && (
                          <div
                            className="plan-avatar-overlap"
                            style={{ background: plan.creator.avatarColor }}
                            title={`Host: ${plan.creator.displayName}`}
                          >
                            {plan.creator.displayName?.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                        {(plan.invitedFriends || []).map((f, i) => (
                          <div
                            key={i}
                            className="plan-avatar-overlap"
                            style={{ background: f.avatarColor || 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                            title={f.displayName}
                          >
                            {f.displayName?.substring(0, 1).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontSize: '0.74rem', fontWeight: 600 }}>
                      <span>Spot details</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Zap size={32} />
              </div>
              <h3>No planned outings yet</h3>
              <p>Pick any spot in the Discover feed or from your Saved list and tap "⚡ Plan with Friends" to buzz them!</p>
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 18px', marginTop: 10 }}
                onClick={onGoToDiscover}
              >
                Browse Spots to Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
