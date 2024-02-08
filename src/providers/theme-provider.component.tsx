'use client';

import useLocalStorage from '#/hooks/use-local-storage.hook';
import { createContext, PropsWithChildren, useContext, useEffect } from 'react';

export type ThemeContextType = {
  isDarkMode: boolean;
  changeTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  changeTheme: () => null,
});

export default function ThemeProvider(props: Readonly<PropsWithChildren>) {
  const { value, setToLocalStorage } = useLocalStorage('theme', {
    theme: 'dark',
  });

  const changeTheme = () => {
    setToLocalStorage({ theme: value.theme === 'dark' ? 'light' : 'dark' });
  };

  const isDarkMode = (): boolean => {
    return value.theme === 'dark';
  };

  useEffect(() => {
    if (
      value.theme === 'dark' ||
      (!('theme' in value) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.querySelector('html')?.classList.add('dark');
    } else {
      document.querySelector('html')?.classList.remove('dark');
    }
  }, [value.theme]);

  return (
    <ThemeContext.Provider value={{ changeTheme, isDarkMode: isDarkMode() }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }

  return context;
};
