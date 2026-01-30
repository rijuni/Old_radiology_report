/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#f4f6f8',
        'brand-header': '#c8f3e8',
        'brand-alert-bg': '#ffe1dc',
        'brand-alert-text': '#ff0000',
        'brand-search-bg': '#fff7d6',
        'brand-search-inner': '#d9ecff',
        'brand-btn': '#1f3d2b',
        'brand-btn-hover': '#2f6d4a',
        'brand-th': '#3aaed8',
        'brand-footer': '#f85a5a',
      },
      animation: {
        'blink': 'blink 1.5s infinite',
      },
      keyframes: {
        blink: {
          '50%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
