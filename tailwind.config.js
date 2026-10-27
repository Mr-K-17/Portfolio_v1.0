/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          bg: '#a9282d',
          dark: '#8b1f23',
          light: '#c43339',
        },
        velvet: {
          DEFAULT: '#8b1f23',
          card: 'rgba(139, 31, 35, 0.85)',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F3E5AB',
          muted: '#C5A059',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
