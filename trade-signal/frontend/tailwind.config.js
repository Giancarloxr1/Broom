/** @type {import('tailwindcss').Config} */
// Tailwind config con palette Trade Signal:
// - navy (sfondo dark)
// - orange (CTA principali)
// - buy (verde segnale BUY) / sell (rosso segnale SELL)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A1A2E',
          50: '#E6E6EC',
          100: '#B8B9C7',
          400: '#3A3A55',
          600: '#24243E',
          700: '#1F1F36',
          800: '#15152B',
          900: '#0F0F20',
        },
        orange: {
          DEFAULT: '#FF5733',
          400: '#FF7A5C',
          500: '#FF5733',
          600: '#E8431F',
          700: '#B8341A',
        },
        buy: { DEFAULT: '#22C55E', dark: '#15803D' },
        sell: { DEFAULT: '#EF4444', dark: '#B91C1C' },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
