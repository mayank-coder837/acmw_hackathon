import React from 'react';
import { cn } from '../../lib/utils';

/**
 * 21st.dev / Magic UI inspired BorderBeam component
 * Renders an animated glowing border beam traveling continuously around the container.
 */
export function BorderBeam({
  className,
  duration = 6,
  borderWidth = 1.5,
  colorFrom = '#06b6d4',
  colorTo = '#8b5cf6',
  colorMid = '#38bdf8'
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden",
        className
      )}
      style={{
        padding: `${borderWidth}px`
      }}
    >
      <div
        className="absolute inset-[-150%] animate-spin"
        style={{
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, ${colorFrom} 310deg, ${colorMid} 335deg, ${colorTo} 360deg)`
        }}
      />
      {/* Inner background mask to keep card contents clean and only reveal the thin glowing perimeter */}
      <div className="absolute inset-[1.5px] rounded-[inherit] bg-card pointer-events-none -z-0 opacity-95" />
    </div>
  );
}
