/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#FFE066', // Bright soft gold based on image
          goldDark: '#C9971E',
          charcoal: '#2D3142', // Deep charcoal
          gray: '#F4F5F7', // Soft background gray
          white: '#FFFFFF',
          // Dark mode surfaces
          dark: '#16171F',
          darkCard: '#1E202B',
          darkBorder: '#2A2C3A',
        },
        success: '#4CAF50',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#45B7D1',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '200ms',
        'slow': '320ms',
      },
      keyframes: {
        'toast-in': {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'toast-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-16px)', opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'count-up': {
          '0%': { opacity: '0.4' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'toast-in': 'toast-in 220ms ease-out',
        'toast-out': 'toast-out 180ms ease-in forwards',
        'scale-in': 'scale-in 180ms ease-out',
      },
    },
  },
  plugins: [],
}
