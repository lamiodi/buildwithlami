import { useCallback, useEffect, useRef, useState } from 'react';
import { applyTheme, browserStorage, createThemeController, THEME_OVERRIDE_KEY } from '../utils/theme.js';

export function useAutomaticTheme(ready) {
  const [appearance, setAppearance] = useState(() => ({
    isDark: document.documentElement.classList.contains('dark'), notice: null
  }));
  const controller = useRef(null);

  useEffect(() => {
    const next = createThemeController({
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      storage: browserStorage('localStorage'), session: browserStorage('sessionStorage'),
      canNotify: () => ready && document.visibilityState !== 'hidden',
      onChange: state => {
        applyTheme(state.isDark ? 'dark' : 'light');
        setAppearance(state);
      }
    });
    controller.current = next;
    next.start();
    const refresh = () => next.reconcile();
    const refreshStorage = event => {
      if (event.key === THEME_OVERRIDE_KEY || event.key === null) next.synchronize();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refreshStorage);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      next.stop();
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refreshStorage);
      document.removeEventListener('visibilitychange', refresh);
      controller.current = null;
    };
  }, [ready]);

  const toggleTheme = useCallback(() => controller.current?.toggle(), []);
  const keepTheme = useCallback(() => controller.current?.keepCurrent(), []);
  const switchThemeNow = useCallback(() => controller.current?.switchNow(), []);
  return { ...appearance, toggleTheme, keepTheme, switchThemeNow };
}
