import React, { useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, HardDrive, Sparkles, Mail, BadgeCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function ProfileModal({ user, savedCount, totalSpotsCount, onClose, onUserUpdated, onOpenWelcome }) {
  // Lock background scroll when modal is open
  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.overflow = 'hidden';
    return () => {
      if (mainContent) mainContent.style.overflow = '';
    };
  }, []);

  const handleResetSession = () => {
    if (window.confirm('Reset this anonymous session to generate a fresh new explorer identity? (Great for multi-user demo)')) {
      const freshUser = authService.resetAnonymousSession();
      onUserUpdated(freshUser);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <h2 className="modal-title">My Profile & Sync</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Identity Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '18px'
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: user?.avatarColor || 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
              position: 'relative'
            }}
          >
            {user?.initials || 'ME'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {user?.displayName}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: user?.isAnonymous ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: user?.isAnonymous ? '#fbbf24' : '#34d399',
                  border: `1px solid ${user?.isAnonymous ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}
              >
                {user?.isAnonymous ? 'Guest' : (user?.emailVerified ? '✓ Verified' : 'Unverified')}
              </span>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              UID: {user?.uid?.substring(0, 16)}...
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#38bdf8' }}>{savedCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Saved Spots</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa' }}>{totalSpotsCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total Blips</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>100%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Offline Ready</div>
          </div>
        </div>

        {/* Architecture Note */}
        <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            <HardDrive size={13} color="#06b6d4" />
            <span>Offline-First Storage Engine</span>
          </div>
          IndexedDB + Service Worker cache is active. All discoveries and saved spots are stored locally and will persist through restarts.
        </div>

        {/* Revisit Welcome Tour */}
        {onOpenWelcome && (
          <button
            className="btn-secondary"
            onClick={() => {
              onClose();
              onOpenWelcome();
            }}
            style={{
              fontSize: '0.82rem',
              marginBottom: '10px',
              background: 'rgba(6, 182, 212, 0.1)',
              borderColor: 'rgba(6, 182, 212, 0.4)',
              color: '#38bdf8'
            }}
          >
            <Sparkles size={14} color="#06b6d4" />
            <span>Revisit Welcome & Sonar Tour</span>
          </button>
        )}

        {/* Multi-user demo helper */}
        {user?.isAnonymous && (
          <button
            className="btn-secondary"
            onClick={handleResetSession}
            style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}
          >
            <RefreshCw size={13} />
            Switch to New Explorer (Simulate Another User)
          </button>
        )}
      </div>
    </div>
  );
}
