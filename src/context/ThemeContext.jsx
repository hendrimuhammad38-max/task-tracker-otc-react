import React, { createContext, useContext, useState, useEffect } from 'react';
import { store } from '../utils/formatters';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => store.get('tto_theme', 'light'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    store.set('tto_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
