// src/context/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'mopal_theme'; // 'light' | 'dark' | 'system'

const getSystemPref = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (resolved) => {
  // TEMPORARILY DISABLED — dark mode is off app-wide for now.
  // To re-enable: restore the two lines below.
  const root = document.documentElement;
  root.classList.remove('dark');
  // if (resolved === 'dark') root.classList.add('dark');
  // else root.classList.remove('dark');
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'light');
  const [resolved, setResolved] = useState(() => (theme === 'system' ? getSystemPref() : theme));

  useEffect(() => {
    const next = theme === 'system' ? getSystemPref() : theme;
    setResolved(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const next = getSystemPref();
      setResolved(next);
      applyTheme(next);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
