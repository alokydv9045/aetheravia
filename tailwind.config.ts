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
        light: {
          ...daisyuiThemes['light'],
          primary: '#904917',
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
        // New Artisanal Heritage Palette
        primary: {
          DEFAULT: '#904917',
          foreground: '#ffffff',
          container: '#ae602d',
        },
        secondary: {
          DEFAULT: '#725a39',
          foreground: '#ffffff',
          container: '#fbdbb0',
        },
        surface: {
          DEFAULT: '#fcf9f4',
          foreground: '#1c1c19',
          dim: '#dcdad5',
          bright: '#fcf9f4',
          container: {
            DEFAULT: '#f0ede8',
            low: '#f6f3ee',
            lowest: '#ffffff',
            high: '#ebe8e3',
            highest: '#e5e2dd',
          }
        },
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#765f3d',
        'on-surface': '#1c1c19',
        'on-surface-variant': '#50443d',
        brand: {
          DEFAULT: '#904917',
          black: '#1c1c19',
        },
        outline: {
          DEFAULT: '#82746c',
          variant: '#d4c3b9',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: '#fcf9f4',
        foreground: '#1c1c19',
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
        lg: '0.25rem',
        md: '0.125rem',
        sm: '0.125rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      fontFamily: {
        headline: ['Noto Serif', 'serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
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
