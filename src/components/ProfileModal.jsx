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
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              user?.initials || 'ME'
            )}
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
                  background: user?.isAnonymous ? 'rgba(245, 158, 11, 0.15)' : (user?.provider === 'google' ? 'rgba(66, 133, 244, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                  color: user?.isAnonymous ? '#fbbf24' : (user?.provider === 'google' ? '#60a5fa' : '#34d399'),
                  border: `1px solid ${user?.isAnonymous ? 'rgba(245, 158, 11, 0.3)' : (user?.provider === 'google' ? 'rgba(66, 133, 244, 0.3)' : 'rgba(16, 185, 129, 0.3)')}`
                }}
              >
                {user?.isAnonymous ? 'Guest' : (user?.provider === 'google' ? 'Google Account' : 'Verified')}
              </span>
            </div>

            {user?.email && (
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                {user.email}
              </div>
            )}

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

        {/* Sign In with Google if guest */}
        {user?.isAnonymous ? (
          <button
            type="button"
            className="btn-google-auth"
            style={{ marginBottom: '10px' }}
            onClick={async () => {
              const res = await authService.signInWithGoogle();
              if (res.user) {
                onUserUpdated(res.user);
                onClose();
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="google-svg-icon">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            style={{ marginBottom: '10px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={async () => {
              await authService.signOut();
              const fresh = authService.getCurrentUser();
              onUserUpdated(fresh);
              onClose();
            }}
          >
            <X size={14} />
            <span>Sign Out of Account</span>
          </button>
        )}

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
