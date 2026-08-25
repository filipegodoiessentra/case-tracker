/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b3ccff',
          300: '#84acff',
          400: '#5285ff',
          500: '#2f5fff',
          600: '#1e42db',
          700: '#1a34ad',
          800: '#182c85',
          900: '#16266a',
        },
      },
    },
  },
  plugins: [],
};
