import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} });

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('fadely-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  // Auto-detect system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    // Apply without flicker — transition handled by CSS
    root.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('fadely-theme', theme); } catch {}
  }, [theme]);

  // Listen for system preference changes (when user hasn't set a preference)
  useEffect(() => {
    const stored = (() => { try { return localStorage.getItem('fadely-theme'); } catch { return null; } })();
    if (stored) return; // User has explicit preference, don't auto-switch

    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const handler = (e) => setThemeState(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = (t) => setThemeState(t);
  const toggle = () => setThemeState(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}