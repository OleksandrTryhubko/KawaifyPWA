import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import clsx from "clsx";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export default function ThemeToggle({ className, compact }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark-pink";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        "inline-flex items-center gap-2 rounded-lg border transition",
        "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)]",
        "hover:border-pink-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50",
        compact ? "p-2" : "px-3 py-2 text-sm",
        className
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light pink theme" : "Dark pink theme"}
    >
      {isDark ? <Sun className="h-4 w-4 text-pink-300" /> : <Moon className="h-4 w-4 text-purple-600" />}
      {!compact && (
        <span className="text-[var(--text-muted)]">
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
