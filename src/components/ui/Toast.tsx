import { useEffect } from "react";
import clsx from "clsx";
import type { ToastType } from "../../hooks/useToast";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const typeStyles: Record<ToastType, string> = {
  success: "border-pink-500/60 bg-gradient-to-r from-zinc-900 to-purple-950/80",
  error: "border-red-500/60 bg-gradient-to-r from-zinc-900 to-red-950/40",
  info: "border-purple-500/60 bg-gradient-to-r from-zinc-900 to-indigo-950/60",
  warning: "border-amber-500/60 bg-gradient-to-r from-zinc-900 to-amber-950/40",
};

const accentDot: Record<ToastType, string> = {
  success: "bg-pink-500",
  error: "bg-red-500",
  info: "bg-purple-500",
  warning: "bg-amber-400",
};

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      className={clsx(
        "pointer-events-auto flex items-start gap-3 min-w-[260px] max-w-sm px-4 py-3 rounded-lg border shadow-lg",
        "text-white text-sm backdrop-blur-sm animate-toast-in",
        typeStyles[toast.type]
      )}
    >
      <span className={clsx("mt-1.5 w-2 h-2 rounded-full shrink-0", accentDot[toast.type])} />
      <p className="flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-400 hover:text-white text-lg leading-none shrink-0"
        aria-label="Закрити"
      >
        ×
      </button>
    </div>
  );
}
