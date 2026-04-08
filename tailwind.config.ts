import type { Config } from 'tailwindcss';
import tailwindAnimate from 'tailwindcss-animate';
import daisyui from 'daisyui';
// @ts-ignore
import daisyuiThemes from 'daisyui/src/theming/themes';

const config: Config = {
  // Dark mode removed — keep default Tailwind behavior (no explicit dark mode)
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  daisyui: {
    // Keep only the light theme to avoid dark-mode variants
    themes: [
      {
        light: {
          ...daisyuiThemes['light'],
          primary: '#B78C69',
          '.toaster-con': {
            'background-color': 'white',
            color: 'black',
          },
        },
      },
    ],
  },
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        green: {
          50: '#f8f3f0',
          100: '#ede2d9',
          200: '#decbbd',
          300: '#ceb4a0',
          400: '#c1a084',
          500: '#B78C69',
          600: '#a47e5f',
          700: '#89694f',
          800: '#6e543f',
          900: '#533f2f',
        },
        gray: {
          50: '#F8F3F0',
          100: '#EDE2D9',
          200: '#DECBBD',
          300: '#CEB4A0',
          400: '#C1A084',
          500: '#B78C69',
          600: '#A47E5F',
          700: '#89694F',
          800: '#644D3A',
          900: '#3D2F23', // Deep brown for text
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindAnimate, daisyui],
} satisfies Config;

export default config;
