/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark navy backgrounds
        'navy': {
          950: '#040d1a',
          900: '#0a1628',
          800: '#0f1f3d',
          700: '#152849',
          600: '#1e3a5f',
        },
        // Card surfaces
        'surface': {
          900: '#111827',
          800: '#1a2540',
          700: '#1e2d4a',
          600: '#243356',
        },
        // Accent teal/cyan
        'accent': {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        // Legacy brand tokens (kept for safety)
        'brand': '#50AFAD',
        'brand-dark': '#3d8584',
        'brand-bg': '#040d1a',
        'brand-header': '#50AFAD',
        'brand-alert-bg': '#451a03',
        'brand-alert-text': '#fb923c',
        'brand-search-bg': '#0f1f3d',
        'brand-search-inner': '#1a2540',
        'brand-btn': '#50AFAD',
        'brand-btn-hover': '#3d8584',
        'brand-th': '#50AFAD',
        'brand-footer': '#0a1628',
      },
      animation: {
        'blink': 'blink 1.5s infinite',
        'fadeIn': 'fadeIn 0.4s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(6,182,212,0.35)',
        'glow-teal-sm': '0 0 10px rgba(6,182,212,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
