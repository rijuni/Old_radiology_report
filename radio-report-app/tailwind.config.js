/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#f0f4f8',
        'brand-header': '#ffffff',
        'brand-alert-bg': '#ffe1dc',
        'brand-alert-text': '#ff0000',
        'brand-search-bg': '#ffffff',
        'brand-search-inner': '#f8fafc',
        'brand-btn': '#0f766e',
        'brand-btn-hover': '#115e59',
        'brand-th': '#0ea5e9', // Sky blue for vibrant gradient base
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
