import React from 'react';

/**
 * 21st.dev / Magic UI inspired BorderBeam component
 * Renders an animated glowing border beam traveling continuously around the container.
 */
export function BorderBeam({ duration = 5 }) {
  return (
    <div className="border-beam-container">
      <div
        className="border-beam-spinner"
        style={{
          animationDuration: `${duration}s`
        }}
      />
      <div className="border-beam-mask" />
    </div>
  );
}
