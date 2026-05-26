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
        igor: {
          light: '#60a5fa',
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
        },
        diana: {
          light: '#f472b6',
          DEFAULT: '#db2777',
          dark: '#be185d',
        },
        comun: {
          light: '#34d399',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        ninos: {
          light: '#fb923c',
          DEFAULT: '#ea580c',
          dark: '#c2410c',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
