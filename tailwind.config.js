// tailwind.config.js
/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float-apple': 'floatApple 3s ease-in-out infinite',
        'pulse-apple': 'pulseApple 2s ease-in-out infinite',
        'shine-apple': 'shineApple 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)' }
        },
        floatApple: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-10px) translateX(5px)' }
        },
        pulseApple: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(255, 255, 255, 0.2)' 
          }
        },
        shineApple: {
          '0%': { backgroundPosition: '200% 200%' },
          '100%': { backgroundPosition: '-200% -200%' }
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      backdropBlur: {
        xs: '2px',
        sm: '10px',
        md: '15px',
        lg: '20px',
        xl: '25px',
      },
    },
  },
  plugins: [
    daisyui
  ],
}