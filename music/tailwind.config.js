/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0b0b0d',
        panel: '#141417',
        elevated: '#1d1d22',
        hover: '#26262c',
        line: '#2c2c33',
        subtle: '#a1a1aa',
        accent: '#22d07a',
        'accent-strong': '#3ee68f',
      },
      fontFamily: { sans: ['Heebo', 'system-ui', '-apple-system', 'sans-serif'] },
      keyframes: {
        eq: { '0%,100%': { transform: 'scaleY(0.3)' }, '50%': { transform: 'scaleY(1)' } },
      },
      animation: { eq: 'eq 0.9s ease-in-out infinite' },
    },
  },
  plugins: [],
};
