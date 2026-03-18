/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.2)' },
          '30%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.2)' },
          '60%': { transform: 'scale(1)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translateY(-30px) scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'translateY(-60px) scale(1)', opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'heartbeat': 'heartbeat 1s ease-in-out infinite',
        'float-up': 'float-up 1.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
