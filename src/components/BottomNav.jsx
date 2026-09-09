import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Radio, Bookmark, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomNav({ activeTab, onTabChange, savedCount, liveCount }) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Compass, badge: null },
    { id: 'feed', label: 'Live Feed', icon: Radio, badge: liveCount > 0 ? (liveCount > 99 ? '99+' : liveCount) : null },
    { id: 'saved', label: 'My Saved', icon: Bookmark, badge: savedCount > 0 ? savedCount : null },
    { id: 'profile', label: 'Profile', icon: User, badge: null }
  ];

  return (
    <nav className="app-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={cn("nav-item relative z-10", isActive && "active")}
            onClick={() => onTabChange(tab.id)}
          >
            {isActive && (
              <motion.div
                layoutId="activeNavPill"
                className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-full -z-10 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <Icon size={22} className="relative transition-transform duration-200" />
            <span>{tab.label}</span>
            {tab.badge && <span className="nav-badge">{tab.badge}</span>}
          </button>
        );
      })}
    </nav>
  );
}
