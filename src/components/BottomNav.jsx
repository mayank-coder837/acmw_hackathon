import React from 'react';
import { Compass, Radio, Bookmark, User } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, savedCount, liveCount }) {
  return (
    <nav className="app-bottom-nav">
      <button
        className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => onTabChange('discover')}
      >
        <Compass size={22} />
        <span>Discover</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => onTabChange('feed')}
      >
        <Radio size={22} />
        <span>Live Feed</span>
        {liveCount > 0 && <span className="nav-badge">{liveCount > 99 ? '99+' : liveCount}</span>}
      </button>

      <button
        className={`nav-item ${activeTab === 'saved' ? 'active' : ''}`}
        onClick={() => onTabChange('saved')}
      >
        <Bookmark size={22} />
        <span>My Saved</span>
        {savedCount > 0 && <span className="nav-badge">{savedCount}</span>}
      </button>

      <button
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <User size={22} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
