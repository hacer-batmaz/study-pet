/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          dark: '#1e1b2e',
          card: '#2a2438',
          accent: '#ffb86c',
          green: '#50fa7b',
          pink: '#ff79c6',
          purple: '#bd93f9'
        }
      }
    },
  },
  plugins: [],
}