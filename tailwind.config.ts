import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: '#003d9b',
        'primary-container': '#0052cc',
        'primary-tint': '#0c56d0',
        'on-primary': '#ffffff',

        // Secondary / Teal (AI + Innovation)
        secondary: '#006a6a',
        'secondary-container': '#9cf0ef',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#00201f',

        // Tertiary (supporting UI)
        tertiary: '#3c4455',
        'tertiary-container': '#c1cadf',
        'on-tertiary': '#ffffff',

        // Error
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#410002',

        // Surface hierarchy (The Layering Principle)
        surface: '#f7fafc',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f1f4f6',
        'surface-container': '#e8ecef',
        'surface-container-high': '#e2e6ea',

        // On-surface text
        'on-surface': '#181c1e',
        'on-surface-variant': '#434654',

        // Outline
        outline: '#747688',
        'outline-variant': '#c3c6d6',

        // Warning
        warning: '#b45309',
        'warning-container': '#fef3c7',
        'on-warning': '#ffffff',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'headline-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'title-lg': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'title-md': ['0.9375rem', { lineHeight: '1.5', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.6' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
        'label-md': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.025em' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        // 8px grid system
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '2.5': '20px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
        '9': '72px',
        '10': '80px',
        '12': '96px',
        '14': '112px',
        '16': '128px',
      },
      boxShadow: {
        ambient: '0px 20px 40px rgba(24, 28, 30, 0.06)',
        'ambient-md': '0px 8px 24px rgba(24, 28, 30, 0.08)',
        'ambient-sm': '0px 4px 12px rgba(24, 28, 30, 0.06)',
      },
      backdropBlur: {
        glass: '24px',
      },
      backgroundImage: {
        'power-gradient': 'linear-gradient(135deg, #003d9b 0%, #0052cc 100%)',
        'teal-gradient': 'linear-gradient(135deg, #006a6a 0%, #00897b 100%)',
        'surface-gradient': 'linear-gradient(180deg, #f7fafc 0%, #f1f4f6 100%)',
      },
      animation: {
        'pulse-tint': 'pulse-tint 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'shake': 'shake 0.35s ease-in-out',
      },
      keyframes: {
        'pulse-tint': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
