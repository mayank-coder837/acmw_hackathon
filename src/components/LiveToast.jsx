import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bookmark, X, UserPlus, Users, Zap } from 'lucide-react';

export default function LiveToast({ toasts, onDismissToast, onSelectSpot }) {
  const getIcon = (type) => {
    switch (type) {
      case 'NEW_SPOT':
        return <Sparkles size={16} />;
      case 'FRIEND_REQ_TOAST':
        return <UserPlus size={16} color="#38bdf8" />;
      case 'FRIEND_ACCEPTED_TOAST':
        return <Users size={16} color="#34d399" />;
      case 'PLAN_RESP_TOAST':
      case 'BLIP_INVITE_TOAST':
        return <Zap size={16} color="#f59e0b" fill="#f59e0b" />;
      default:
        return <Bookmark size={16} />;
    }
  };

  return (
    <div className="live-toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="live-toast"
            onClick={() => {
              if (toast.spot) onSelectSpot(toast.spot);
              onDismissToast(toast.id);
            }}
          >
            <div className="live-toast-icon">
              {getIcon(toast.type)}
            </div>

            <div className="live-toast-text">
              {toast.message ? (
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.82rem' }}>
                  {toast.message}
                </div>
              ) : (
                <>
                  <div>
                    <strong>{toast.user?.displayName || 'Nearby Explorer'}</strong>{' '}
                    {toast.type === 'NEW_SPOT' ? 'dropped a new spot:' : 'just saved:'}
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {toast.spot?.emoji || '📍'} {toast.spot?.name}
                  </div>
                </>
              )}
            </div>

            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 4
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDismissToast(toast.id);
              }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
