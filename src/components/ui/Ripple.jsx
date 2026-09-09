import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * 21st.dev / Magic UI inspired Ripple / Radar component
 * Concentric animated pulses radiating outward with glowing cyan/blue light.
 */
export const Ripple = React.memo(function Ripple({
  mainCircleSize = 140,
  numCircles = 5,
  className
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center select-none",
        className
      )}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 65;
        const borderStyle = i % 2 === 0 ? 'solid' : 'dashed';

        return (
          <motion.div
            key={i}
            className="absolute rounded-full border border-cyan-400/30 bg-cyan-500/[0.012] shadow-[0_0_25px_rgba(6,182,212,0.18)]"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderStyle
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.85, 1.15, 0.85],
              opacity: [0.15, 0.45, 0.15],
              borderColor: [
                'rgba(6, 182, 212, 0.25)',
                'rgba(59, 130, 246, 0.45)',
                'rgba(139, 92, 246, 0.25)'
              ]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.55
            }}
          />
        );
      })}
    </div>
  );
});
