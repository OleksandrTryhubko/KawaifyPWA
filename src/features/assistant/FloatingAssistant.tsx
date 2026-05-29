import { useEffect, useState } from "react";
import clsx from "clsx";
import { MessageCircle, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Button";

const QUICK_CHIPS = [
  "Find chill music",
  "Create playlist",
  "Explain mood",
] as const;

const AUTH_ROUTES = ["/login", "/register"];

export default function FloatingAssistant() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const hiddenRoute = AUTH_ROUTES.includes(pathname);
  const visible = Boolean(user) && !hiddenRoute;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!visible) return null;

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div
      className="fixed z-40 flex flex-col items-end gap-3 pointer-events-none"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "calc(7.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {open && (
        <div
          className={clsx(
            "pointer-events-auto kawaify-card shadow-xl flex flex-col overflow-hidden",
            "w-[min(calc(100vw-2rem),22rem)] sm:w-80",
            "max-h-[min(70vh,28rem)]"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Kawaify AI assistant"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border)] shrink-0">
            <h2 className="text-base font-semibold text-[var(--text)]">Kawaify AI</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-pink-400/50"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-3 overflow-y-auto flex-1 min-h-0">
            <p className="text-sm kawaify-text-muted">
              Music assistant coming soon
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] kawaify-text-muted opacity-75 cursor-not-allowed"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <input
                type="text"
                disabled
                placeholder="Ask something…"
                className="kawaify-input h-10 px-3 text-sm opacity-75 cursor-not-allowed"
                aria-label="Assistant prompt"
              />
              <Button type="button" variant="secondary" size="sm" disabled fullWidth>
                Ask
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled
                fullWidth
                title="Full assistant page coming soon"
              >
                Open full assistant
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        className={clsx(
          "pointer-events-auto h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-pink-500 to-purple-600 text-white",
          "flex items-center justify-center",
          "hover:scale-105 active:scale-95 transition-transform",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60 focus-visible:ring-offset-2",
          open && "ring-2 ring-pink-400/40"
        )}
        aria-label={open ? "Close Kawaify AI" : "Open Kawaify AI"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
