import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'app_theme_v1';

const resolveTheme = (mode) => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
};

const applyThemeClass = (resolved) => {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.theme = resolved;
};

export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() =>
    typeof window !== 'undefined' ? resolveTheme(theme) : 'light'
  );

  const setTheme = useCallback((next) => {
    setThemeState(next);
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    applyThemeClass(resolved);
    setResolvedTheme(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return undefined;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved = resolveTheme('system');
      applyThemeClass(resolved);
      setResolvedTheme(resolved);
    };

    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return {
    theme,
    setTheme,
    isDark: resolvedTheme === 'dark',
    resolvedTheme,
  };
};