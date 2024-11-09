'use client';

import useLocalStorage from '#/hooks/use-local-storage.hook';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  const [theme, setTheme] = useState('dark');

  const changeTheme = () => {
    const newTheme = value.theme === 'dark' ? 'light' : 'dark';

    fetch('/api/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: newTheme }),
    });
    setTheme(newTheme);
    setToLocalStorage({ theme: value.theme === 'dark' ? 'light' : 'dark' });

    if (
      newTheme === 'dark' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      document.querySelector('html')?.classList?.add('dark');
    } else {
      document.querySelector('html')?.classList?.remove('dark');
    }

    window.umami.track('Theme changed', { theme: newTheme });
  };

  const isDarkMode = (): boolean => {
    return theme === 'dark';
  };

  useEffect(() => {
    const serverSideTheme = document
      .querySelector('html')
      ?.classList.contains('dark')
      ? 'dark'
      : 'light';

    setTheme(serverSideTheme);
  }, []);

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
