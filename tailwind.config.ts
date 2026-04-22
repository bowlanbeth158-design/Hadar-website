import type { Config } from 'tailwindcss';

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
    },
  },
  plugins: [],
};

export default config;
