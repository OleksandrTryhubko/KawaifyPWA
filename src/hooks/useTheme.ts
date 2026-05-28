import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  STORAGE_KEY,
  type ThemeId,
} from "../themeInit";

export type { ThemeId };

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark-pink" ? "light-pink" : "dark-pink"));
  }, []);

  return { theme, setTheme, toggleTheme, isDark: theme === "dark-pink" };
}
