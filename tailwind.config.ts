import type { Config } from 'tailwindcss';
// .background-animate {
//     background-size: 400%;
//
//     -webkit-animation: AnimationName 3s ease infinite;
//     -moz-animation: AnimationName 3s ease infinite;
//     animation: AnimationName 3s ease infinite;
//   }
//
//   @keyframes AnimationName {
//     0%,
//     100% {
//       background-position: 0% 50%;
//     }
//     50% {
//       background-position: 100% 50%;
//     }
//   }

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
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
        'shake-infinite': 'shake 1s ease-in-out infinite',
        shake: 'shake 1s ease-in-out forwards',
      },
      gridTemplateColumns: {
        '4-auto': 'repeat(4, minmax(0, auto))',
        '2-auto': 'repeat(2, minmax(0, auto))',
      },
      boxShadow: {
        card: '0 2.8px 2.2px rgb(0 0 0 / 0.02), 0 1.7px 2.3px rgb(0 0 0 / 0.010), 0 1.5px 1px rgb(0 0 0 / 0.010), 0 43px 55.9px rgb(0 0 0 / 0.010), 0 55.8px 60.4px rgb(0 0 0 / 0.010), 0 100px 80px rgb(0 0 0 / 0.010)',
        // 'card': '0 2.8px 2.2px rgb(0 0 0 / 0.02), 0 1.7px 2.3px rgb(0 0 0 / 0.025), 0 1.5px 1px rgb(0 0 0 / 0.025), 0 43px 55.9px rgb(0 0 0 / 0.025), 0 55.8px 60.4px rgb(0 0 0 / 0.025), 0 100px 80px rgb(0 0 0 / 0.025)',
        'table-row':
          '0 2.8px 2.2px rgb(0 0 0 / 0.010), 0 1.7px 2.3px rgb(0 0 0 / 0.010), 0 1.5px 1px rgb(0 0 0 / 0.010), 0 43px 55.9px rgb(0 0 0 / 0.010), 0 55.8px 60.4px rgb(0 0 0 / 0.010), 0 40px 80px rgb(0 0 0 / 0.010)',
        'card-hovered':
          '0 2.8px 2.2px rgb(0 0 0 / 0.02), 0 1.7px 2.3px rgb(0 0 0 / 0.03), 0 1.5px 1px rgb(0 0 0 / 0.03), 0 23px 35.9px rgb(0 0 0 / 0.03), 0 25.8px 30.4px rgb(0 0 0 / 0.03), 0 40px 60px rgb(0 0 0 / 0.03)',
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
