/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#FFF8F6',
        'accent-btn': '#795548',
        'text-default': '#4A3423',
        'sidebar-bg': '#FFFFFF',
        'active-link-bg': '#efebe9',
        'active-link-text': '#783A1E',
        'success': '#34A853',
        'error': '#EA4335',
        'light-coffee-brown': '#efebe9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}