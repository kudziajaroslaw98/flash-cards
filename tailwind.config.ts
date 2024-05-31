import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
      },
      backgroundSize: {
        '400%': '400%',
      },
      keyframes: {
        'fade-in-to-bottom': {
          '0%': { opacity: '0', transform: 'translateY(95%)' },
          '100%': { opacity: '1', transform: 'translateY(100%)' },
        },
        'fade-in-to-top': {
          '0%': { opacity: '0', transform: 'translateY(-95%)' },
          '100%': { opacity: '1', transform: 'translateY(-100%)' },
        },
        'fade-out-to-top': {
          '0%': {
            opacity: '1',
            transform: 'translateY(100%)',
            display: 'flex',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(95%)',
            display: 'none',
          },
        },
        'background-gradient': {
          '0%, 100%': {
            backgroundPosition: '0% 25%',
          },
          '25%': {
            backgroundPosition: '25% 75%',
          },
          '50%': {
            backgroundPosition: '100% 100%',
          },
          '75%': {
            backgroundPosition: '75% 25%',
          },
        },
        shake: {
          '10%, 90%': {
            transform: 'translate3d(0, -1px, 0)',
          },
          '20%, 80% ': {
            transform: 'translate3d(0, 2px, 0)',
          },
          '30%, 50%, 70%': {
            transform: 'translate3d(0, -2px, 0)',
          },
          '40%, 60%': {
            transform: 'translate3d(0, 2px, 0)',
          },
        },
      },
      animation: {
        'background-gradient': 'background-gradient 12s ease infinite',
        'fade-in-to-bottom': 'fade-in-to-bottom .3s ease-in-out forwards',
        'fade-in-to-top': 'fade-in-to-top .3s ease-in-out forwards',
        'fade-out-to-top': 'fade-out-to-top .3s ease-in-out forwards',
        'shake-infinite': 'shake 1s ease-in-out infinite',
        shake: 'shake 1s ease-in-out forwards',
      },
      gridTemplateColumns: {
        '4-auto': 'repeat(4, minmax(0, auto))',
        '2-auto': 'repeat(2, minmax(0, auto))',
      },
      boxShadow: {
        card: '0 4px 4px rgb(0 0 0 / 0.02), 0 32px 15.3px rgb(0 0 0 / 0.02)',
        'card-dark':
          '0 4px 4px rgb(143 143 143 / 0.02), 0 32px 15.3px rgb(143 143 143 / 0.02)',
        'table-row':
          '0 2.8px 2.2px rgb(0 0 0 / 0.010), 0 1.7px 2.3px rgb(0 0 0 / 0.010), 0 1.5px 1px rgb(0 0 0 / 0.010), 0 43px 55.9px rgb(0 0 0 / 0.010), 0 55.8px 60.4px rgb(0 0 0 / 0.010), 0 40px 80px rgb(0 0 0 / 0.010)',
        'card-hovered':
          '0 4px 4px rgb(0 0 0 / 0.06), 0 32px 30px rgb(0 0 0 / 0.06)',
        'dark-card-hovered':
          '0 4px 4px rgb(143 143 143 / 0.06), 0 32px 30px rgb(143 143 143 / 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
