import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
}) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Set theme and persist to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Apply theme class on <html> and listen for system changes if needed
  useEffect(() => {
    const root = window.document.documentElement;

    const applyThemeClass = (effectiveTheme: 'dark' | 'light') => {
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const systemThemeListener = (e: MediaQueryListEvent) => {
        applyThemeClass(e.matches ? 'dark' : 'light');
      };

      applyThemeClass(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', systemThemeListener);

      return () => mediaQuery.removeEventListener('change', systemThemeListener);
    } else {
      applyThemeClass(theme);
    }
  }, [theme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored && stored !== theme) {
      setThemeState(stored);
    }
  }, [storageKey]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
