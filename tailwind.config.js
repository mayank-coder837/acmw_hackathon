/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        card: '#131b2e',
        surface: '#1e293b',
        accent: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          emerald: '#10b981'
        }
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 2s ease-out infinite'
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '-200% 0' }
        },
        radar: {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
