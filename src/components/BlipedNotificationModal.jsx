import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MapPin, Calendar, Clock, MessageSquare, Check, X, Navigation } from 'lucide-react';
import { friendService } from '../services/friendService';

export default function BlipedNotificationModal({
  invite,
  onAccept,
  onDecline,
  onSelectSpot
}) {
  if (!invite) return null;

  const { plan } = invite;
  const creator = plan?.creator || { displayName: 'A Friend' };

  // Trigger real sensory buzzing sound and vibration upon arrival!
  useEffect(() => {
    friendService.playBlipBuzzEffect();
  }, [invite?.id]);

  const handleOpenDirections = (e) => {
    e.stopPropagation();
    if (plan?.lat && plan?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${plan.lat},${plan.lng}`, '_blank');
    }
  };

  return (
    <div className="blip-buzz-overlay">
      <motion.div
        className="blip-buzz-modal"
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            damping: 18,
            stiffness: 450
          }
        }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
      >
        {/* Animated Cyber Radar Aura & Lightning Icon */}
        <div className="blip-radar-emitter">
          <div className="blip-pulse-wave wave-1" />
          <div className="blip-pulse-wave wave-2" />
          <div className="blip-icon-badge">
            <Zap size={32} className="blip-zap-icon" />
          </div>
        </div>

        {/* Buzz Notification Header */}
        <div className="blip-buzz-title-wrap">
          <div className="blip-buzz-pill">
            <span className="blip-buzz-dot" />
            LIVE PEER BLIP
          </div>
          <h2 className="blip-buzz-heading">
            ⚡ YOU HAVE BEEN BLIPED! ⚡
          </h2>
          <p className="blip-buzz-subtitle">
            <strong style={{ color: '#38bdf8' }}>{creator.displayName}</strong> invites you to explore together!
          </p>
        </div>

        {/* Spot Preview Card */}
        <div
          className="blip-spot-preview-box"
          onClick={() => {
            if (onSelectSpot) onSelectSpot(plan);
          }}
        >
          <div className="blip-spot-top">
            <span className="blip-spot-emoji">{plan?.spotEmoji || '📍'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="spot-badge" style={{ textTransform: 'capitalize' }}>
                  {plan?.spotCategory || 'Spot'}
                </span>
                <span className="blip-tap-hint">Tap for details</span>
              </div>
              <h3 className="blip-spot-name">{plan?.spotName}</h3>
            </div>
          </div>

          {plan?.spotAddress && (
            <div className="blip-spot-address">
              <MapPin size={12} />
              <span>{plan.spotAddress}</span>
            </div>
          )}

          {/* Time & Note */}
          <div className="blip-meta-row">
            <div className="blip-meta-item">
              <Clock size={13} color="#f59e0b" />
              <span>{plan?.dateTime || 'Tonight'}</span>
            </div>
          </div>

          {plan?.note && (
            <div className="blip-note-bubble">
              <MessageSquare size={13} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
              <span>"{plan.note}"</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="blip-actions-group">
          <button
            className="btn-primary blip-accept-btn"
            onClick={() => onAccept(invite)}
          >
            <Check size={18} />
            <span>Accept & View Plan</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={handleOpenDirections}
            >
              <Navigation size={15} />
              <span>Directions</span>
            </button>
            <button
              className="btn-secondary"
              style={{ color: 'var(--text-muted)' }}
              onClick={() => onDecline(invite)}
            >
              <X size={15} />
              <span>Maybe Later</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
