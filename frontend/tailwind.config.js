/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        medical: {
          blue: '#0284c7',
          dark: '#0f172a',
          slate: '#334155',
          alert: '#ef4444',
          warn: '#f59e0b',
          safe: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
