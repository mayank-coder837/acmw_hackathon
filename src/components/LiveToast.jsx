import React from 'react';
import { Sparkles, Bookmark, X } from 'lucide-react';

export default function LiveToast({ toasts, onDismissToast, onSelectSpot }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="live-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="live-toast"
          onClick={() => {
            if (toast.spot) onSelectSpot(toast.spot);
            onDismissToast(toast.id);
          }}
        >
          <div className="live-toast-icon">
            {toast.type === 'NEW_SPOT' ? <Sparkles size={16} /> : <Bookmark size={16} />}
          </div>

          <div className="live-toast-text">
            <div>
              <strong>{toast.user?.displayName || 'Nearby Explorer'}</strong>{' '}
              {toast.type === 'NEW_SPOT' ? 'dropped a new spot:' : 'just saved:'}
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {toast.spot?.emoji || '📍'} {toast.spot?.name}
            </div>
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
        </div>
      ))}
    </div>
  );
}
