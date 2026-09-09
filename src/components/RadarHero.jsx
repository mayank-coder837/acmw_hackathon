import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Sparkles, MapPin, Compass } from 'lucide-react';
import { Ripple } from './ui/Ripple';

export default function RadarHero({ activeSpotsCount, cityName, isOnline, onViewMap, viewMode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-[#0e1628] to-card p-5 mb-5 shadow-[0_10px_35px_rgba(6,182,212,0.15)] min-h-[140px] flex flex-col justify-between">
      {/* 21st.dev Animated Sonar Ripple Waves */}
      <Ripple numCircles={4} mainCircleSize={100} className="opacity-80" />

      {/* Top row: Status badges */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
          <span className="text-[0.7rem] font-bold uppercase tracking-widest text-cyan-400">
            {isOnline ? 'Active Sonar Sweep' : 'Offline Cache Active'}
          </span>
        </div>

        <span className="flex items-center gap-1 text-[0.72rem] font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
          <Sparkles size={11} className="text-cyan-400" />
          <span>{activeSpotsCount} Nearby Blips</span>
        </span>
      </div>

      {/* Main hero content */}
      <div className="relative z-10 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Nearby Now</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live
            </span>
          </h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <MapPin size={12} className="text-cyan-400 shrink-0" />
            <span>Scanning 2.5km around <strong className="text-slate-200">{cityName}</strong></span>
          </p>
        </div>

        <button
          onClick={onViewMap}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-200 active:scale-95 shrink-0"
        >
          <Compass size={14} className="animate-spin" style={{ animationDuration: '10s' }} />
          <span>{viewMode === 'map' ? 'Show List' : 'Open Map'}</span>
        </button>
      </div>
    </div>
  );
}
