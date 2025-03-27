'use client';

import useLocalStorage from '#/hooks/use-local-storage.hook';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type ThemeContextType = {
  isLightMode: boolean;
  changeTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  isLightMode: false,
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

    setTheme(newTheme);
    setToLocalStorage(theme === 'dark' ? 'light' : 'dark');

    if (newTheme === 'dark') {
      document.querySelector('html')?.classList?.add('dark');
    } else {
      document.querySelector('html')?.classList?.remove('dark');
    }

    window?.umami?.track('Theme changed', { theme: newTheme });
  };

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
