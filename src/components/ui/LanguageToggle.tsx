import clsx from "clsx";
import { Languages } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import type { Language } from "../../i18n/translations";

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

export default function LanguageToggle({ className, compact }: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();

  const cycle = () => {
    const next: Language = language === "en" ? "uk" : "en";
    setLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg border transition",
        "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]",
        "hover:border-pink-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50",
        compact ? "p-2 text-xs font-semibold" : "px-3 py-2 text-sm",
        className
      )}
      aria-label={`Language: ${language === "en" ? t("lang.en") : t("lang.uk")}`}
      title={language === "en" ? t("lang.uk") : t("lang.en")}
    >
      <Languages className="h-4 w-4 text-pink-400 shrink-0" />
      <span className="uppercase tabular-nums">{language}</span>
    </button>
  );
}
