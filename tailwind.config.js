/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          red: '#E52528',
          blue: '#00539C',
          gold: '#FFD700',
          amber: '#FF9E1B',
          glow: '#FFE082',
          fluid: '#FFAE00',
          dark: '#030308',
          card: 'rgba(10, 10, 18, 0.75)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        'cinzel-dec': ['"Cinzel Decorative"', 'Cinzel', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(255, 180, 0, 0.35)',
        'gold-glow-lg': '0 0 50px rgba(255, 200, 50, 0.55)',
        'fluid-glow': '0 0 40px rgba(255, 150, 0, 0.65)',
      }
    },
  },
  plugins: [],
}
