import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary (official brand — see design/brand.md §2.1)
        brand: {
          navy: '#00327D',
          blue: '#0078BA',
          sky: '#DBE5F3',
        },
        // Secondary (gray scale — brand.md §2.2)
        gray: {
          50: '#F7F9FB',
          200: '#E1E1E1',
          400: '#A4A4A4',
          500: '#989898',
        },
        // Accent (brand.md §2.3)
        red: {
          100: '#F8B8B8',
          500: '#EE4444',
          700: '#C0272D',
        },
        green: {
          100: '#BAFFCC',
          500: '#22C45E',
          700: '#009145',
        },
        orange: {
          100: '#FBD185',
          500: '#F29B11',
          600: '#FFB500',
        },
        yellow: {
          100: '#FFF5A3',
          300: '#FBED21',
          500: '#D8C100',
        },
        sky: {
          400: '#29AAE1',
          500: '#00BFEE',
        },
        violet: {
          200: '#BCA6F9',
          500: '#8652FB',
        },
      },
      backgroundImage: {
        // Stat gradients — brand.md §3.1
        'grad-stat-navy': 'linear-gradient(135deg, #0078BA 0%, #00327D 100%)',
        'grad-stat-sky': 'linear-gradient(135deg, #00BFEE 0%, #29AAE1 100%)',
        'grad-stat-red': 'linear-gradient(135deg, #EE4444 0%, #C0272D 100%)',
        'grad-stat-green': 'linear-gradient(135deg, #22C45E 0%, #009145 100%)',
        'grad-stat-orange': 'linear-gradient(135deg, #F29B11 0%, #FFB500 100%)',
        'grad-stat-violet': 'linear-gradient(135deg, #BCA6F9 0%, #8652FB 100%)',
        // Alert gradients — brand.md §3.2
        'grad-alert-orange': 'linear-gradient(135deg, #F29B11 0%, #FFB500 100%)',
        'grad-alert-red': 'linear-gradient(135deg, #EE4444 0%, #C0272D 100%)',
        'grad-alert-green': 'linear-gradient(135deg, #22C45E 0%, #009145 100%)',
        'grad-alert-yellow': 'linear-gradient(135deg, #D8C100 0%, #FBED21 100%)',
        // Report state gradients — brand.md §3.3
        'grad-state-sent': 'linear-gradient(135deg, #FFA200 0%, #E8D50E 100%)',
        'grad-state-review': 'linear-gradient(135deg, #FF0000 0%, #F29B11 100%)',
        'grad-state-published': 'linear-gradient(135deg, #FFB600 0%, #1BBA59 100%)',
        // Page background (gentle blue wash used on most screens)
        'page-gradient': 'linear-gradient(180deg, #DBE5F3 0%, #FFFFFF 50%)',
      },
      fontFamily: {
        // Latin: Poppins (wordmark-compatible). Arabic companion: Cairo.
        sans: ['var(--font-poppins)', 'var(--font-cairo)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
      boxShadow: {
        // Outer glows — brand.md color system applied as soft halos.
        'glow-soft':   '0 6px 24px -6px rgb(0 50 125 / 0.18), 0 0 1px rgb(0 50 125 / 0.05)',
        'glow-navy':   '0 10px 30px -8px rgb(0 50 125 / 0.40), 0 0 0 1px rgb(0 50 125 / 0.04)',
        'glow-blue':   '0 10px 30px -8px rgb(0 120 186 / 0.40), 0 0 0 1px rgb(0 120 186 / 0.04)',
        'glow-red':    '0 10px 30px -8px rgb(238 68 68 / 0.45), 0 0 0 1px rgb(238 68 68 / 0.05)',
        'glow-green':  '0 10px 30px -8px rgb(34 196 94 / 0.45), 0 0 0 1px rgb(34 196 94 / 0.05)',
        'glow-orange': '0 10px 30px -8px rgb(242 155 17 / 0.45), 0 0 0 1px rgb(242 155 17 / 0.05)',
        'glow-violet': '0 10px 30px -8px rgb(134 82 251 / 0.45), 0 0 0 1px rgb(134 82 251 / 0.05)',
        'glow-sky':    '0 10px 30px -8px rgb(0 191 238 / 0.45), 0 0 0 1px rgb(0 191 238 / 0.05)',
        'glow-yellow': '0 10px 30px -8px rgb(216 193 0 / 0.45), 0 0 0 1px rgb(216 193 0 / 0.05)',
      },
      keyframes: {
        'alert-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(238, 68, 68, 0.55)' },
          '70%': { boxShadow: '0 0 0 14px rgba(238, 68, 68, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(238, 68, 68, 0)' },
        },
        'verify-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(34, 196, 94, 0.55)' },
          '70%': { boxShadow: '0 0 0 14px rgba(34, 196, 94, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(34, 196, 94, 0)' },
        },
        'siren-wiggle': {
          '0%, 92%, 100%': { transform: 'rotate(0deg)' },
          '94%': { transform: 'rotate(-14deg)' },
          '96%': { transform: 'rotate(14deg)' },
          '98%': { transform: 'rotate(-8deg)' },
        },
        'float-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-6px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'modal-pop': {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pulse-orange': {
          '0%': { boxShadow: '0 0 0 0 rgba(242, 155, 17, 0.55)' },
          '70%': { boxShadow: '0 0 0 14px rgba(242, 155, 17, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(242, 155, 17, 0)' },
        },
        'pulse-yellow': {
          '0%': { boxShadow: '0 0 0 0 rgba(216, 193, 0, 0.55)' },
          '70%': { boxShadow: '0 0 0 14px rgba(216, 193, 0, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(216, 193, 0, 0)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translate3d(0, -10vh, 0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translate3d(0, 110vh, 0) rotate(720deg)', opacity: '0.4' },
        },
        'sparkle-pop': {
          '0%, 100%': { transform: 'scale(0.8) rotate(0deg)', opacity: '0.7' },
          '50%': { transform: 'scale(1.15) rotate(20deg)', opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'trend-up': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2.5px)' },
        },
        'trend-down': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(2.5px)' },
        },
      },
      animation: {
        'alert-pulse': 'alert-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'verify-pulse': 'verify-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-orange': 'pulse-orange 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-yellow': 'pulse-yellow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'siren-wiggle': 'siren-wiggle 4s ease-in-out infinite',
        'float-soft': 'float-soft 5s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 200ms ease-out',
        'modal-pop': 'modal-pop 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        'confetti-fall': 'confetti-fall linear forwards',
        'sparkle-pop': 'sparkle-pop 1.6s ease-in-out infinite',
        shimmer: 'shimmer 5s linear infinite',
        'trend-up': 'trend-up 1.4s ease-in-out infinite',
        'trend-down': 'trend-down 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [typography],
};

export default config;
