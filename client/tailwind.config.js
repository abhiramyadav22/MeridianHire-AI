/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['DM Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulsebar: { '0%, 100%': { opacity: '0.7' }, '50%': { opacity: '1' } },
      },
      animation: { shimmer: 'shimmer 2.2s ease-in-out infinite' },
    },
  },
  plugins: [],
};
