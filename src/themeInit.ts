const STORAGE_KEY = "kawaify-theme";
export type ThemeId = "dark-pink" | "light-pink";

export { STORAGE_KEY };

export function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light-pink" ? "light-pink" : "dark-pink";
  } catch {
    return "dark-pink";
  }
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute("data-theme", theme);
}

applyTheme(getStoredTheme());
