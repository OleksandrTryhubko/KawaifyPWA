import { useCallback, useSyncExternalStore } from "react";
import {
  LANGUAGE_STORAGE_KEY,
  translate,
  type Language,
  type TranslationKey,
} from "../i18n/translations";

function readLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "uk" ? "uk" : "en";
}

let currentLanguage: Language = readLanguage();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentLanguage;
}

function setLanguageInternal(lang: Language) {
  currentLanguage = lang;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  document.documentElement.lang = lang === "uk" ? "uk" : "en";
  listeners.forEach((l) => l());
}

if (typeof document !== "undefined") {
  document.documentElement.lang = currentLanguage === "uk" ? "uk" : "en";
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, getSnapshot, () => "en" as Language);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageInternal(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language]
  );

  return { language, setLanguage, t };
}
