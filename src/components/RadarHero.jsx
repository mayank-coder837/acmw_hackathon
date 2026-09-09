import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Sparkles, MapPin } from 'lucide-react';
import { Ripple } from './ui/Ripple';

export default function RadarHero({ activeSpotsCount, cityName, isOnline, onViewMap }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 via-card to-card p-4 mb-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* 21st.dev Ripple Waves */}
      <Ripple numCircles={4} mainCircleSize={110} className="opacity-75" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Radio size={20} className="text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Nearby Radar
                <span className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  {isOnline ? 'Live 2.5km' : 'Offline Mode'}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-cyan-400" />
              <span>Scanning around <strong>{cityName}</strong></span>
            </p>
          </div>
        </div>

        <button
          onClick={onViewMap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all duration-150 active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
        >
          <Sparkles size={12} />
          <span>{activeSpotsCount} Blips</span>
        </button>
      </div>
    </div>
  );
}
