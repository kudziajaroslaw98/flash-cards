import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';
import { Inter, Roboto_Mono } from 'next/font/google';
import '../src/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

const preview: Preview = {
  parameters: {
    tags: ['autodocs'],
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export const decorators = [
  withThemeByClassName({
    themes: {
      // nameOfTheme: 'classNameForTheme',
      light: '',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
  (Story) => (
    <div className={`${inter.variable} ${roboto_mono.variable} p-32 font-sans`}>
      <Story />
    </div>
  ),
];

export default preview;
