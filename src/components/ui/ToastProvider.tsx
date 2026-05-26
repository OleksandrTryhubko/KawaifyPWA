import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Toast, type ToastItem } from "./Toast";
import type { ToastOptions, ToastType } from "../../hooks/useToast";

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = `toast-${++toastId}`;
    const type: ToastType = options?.type ?? "info";
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message) => showToast(message, { type: "success" }),
      error: (message) => showToast(message, { type: "error" }),
      info: (message) => showToast(message, { type: "info" }),
      warning: (message) => showToast(message, { type: "warning" }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
          aria-live="polite"
        >
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
