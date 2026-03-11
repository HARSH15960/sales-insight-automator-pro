/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'void': '#050510',
        'deep': '#0a0a1a',
        'panel': '#0f0f23',
        'surface': '#161630',
        'border': '#252550',
        'muted': '#4a4a7a',
        'subtle': '#7a7aaa',
        'text': '#c8c8e8',
        'bright': '#e8e8ff',
        'indigo': {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        'violet': {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        'emerald': {
          400: '#34d399',
          500: '#10b981',
        },
        'rose': {
          400: '#fb7185',
          500: '#f43f5e',
        },
        'amber': {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        'display': ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
        'body': ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)',
        'glow-radial': 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px'
      }
    },
  },
  plugins: [],
}
