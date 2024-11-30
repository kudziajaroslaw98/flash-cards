'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import useLocalStorage from '#/hooks/use-local-storage.hook';
import { API_ROUTES } from '#/shared/defaults/api-routes';

export type ThemeContextType = {
  isDarkMode: boolean;
  isLightMode: boolean;
  changeTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  isLightMode: true,
  changeTheme: () => null,
});

export default function ThemeProvider(props: Readonly<PropsWithChildren>) {
  const [theme, setTheme] = useState('dark');
  const { setToLocalStorage, initiated } = useLocalStorage({
    key: 'theme',
    defaultValue: 'dark',
    setValue: setTheme,
  });

  const changeTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';

    fetch(API_ROUTES.THEME, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme: newTheme }),
    });
    setTheme(newTheme);
    setToLocalStorage(theme === 'dark' ? 'light' : 'dark');

    if (newTheme === 'dark') {
      document.querySelector('html')?.classList?.add('dark');
    } else {
      document.querySelector('html')?.classList?.remove('dark');
    }

    window.umami.track('Theme changed', { theme: newTheme });
  };

  const isDarkMode = useCallback((): boolean => {
    return theme === 'dark';
  }, [theme]);

  const isLightMode = useCallback((): boolean => {
    return theme === 'light';
  }, [theme]);

  useEffect(() => {
    if (initiated === false) return;
    if (theme === 'dark') {
      document.querySelector('html')?.classList?.add('dark');
    } else {
      document.querySelector('html')?.classList?.remove('dark');
    }
  }, [initiated]);

  return (
    <ThemeContext.Provider
      value={{
        changeTheme,
        isDarkMode: isDarkMode(),
        isLightMode: isLightMode(),
      }}
    >
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
