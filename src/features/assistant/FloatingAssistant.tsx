import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MessageCircle, Send, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import type { AssistantMessage } from "./types";
import {
  loadAssistantMessages,
  sendAssistantMessage,
} from "../../services/assistantService";

const AUTH_ROUTES = ["/login", "/register"];

const CHIP_KEYS = [
  "assistant.chipMood",
  "assistant.chipArtists",
  "assistant.chipGenre",
  "assistant.chipPlaylist",
] as const;

const CHIP_PROMPTS: Record<(typeof CHIP_KEYS)[number], string> = {
  "assistant.chipMood": "Recommend music for coding",
  "assistant.chipArtists": "Recommend similar artists to lofi hip hop",
  "assistant.chipGenre": "Explain phonk",
  "assistant.chipPlaylist": "Create playlist idea for night coding",
};

export default function FloatingAssistant() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const hiddenRoute = AUTH_ROUTES.includes(pathname);
  const visible = Boolean(user) && !hiddenRoute;

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!open || !user?.uid) return;

    setHistoryLoading(true);
    loadAssistantMessages(user.uid, 50)
      .then((msgs) => {
        setMessages(msgs);
        requestAnimationFrame(scrollToBottom);
      })
      .catch(() => {
        /* offline or rules — show empty */
      })
      .finally(() => setHistoryLoading(false));
  }, [open, user?.uid, scrollToBottom]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !user?.uid || loading) return;

    setInput("");
    setLoading(true);
    try {
      const { user: userMsg, assistant } = await sendAssistantMessage(
        user.uid,
        trimmed
      );
      setMessages((prev) => [...prev, userMsg, assistant]);
    } catch {
      toast.error(t("assistant.sendError"));
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fab-root pointer-events-none">
      {open && (
          <div
            className={clsx(
              "fab-panel pointer-events-auto flex flex-col overflow-hidden",
              "animate-scale-in"
            )}
            role="dialog"
            aria-modal="false"
            aria-label={t("assistant.title")}
          >
            <header className="fab-panel-header flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border)] shrink-0">
              <h2 className="text-base font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {t("assistant.title")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--text-muted)]"
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div
              ref={listRef}
              className="fab-messages px-3 py-3 overflow-y-auto flex-1 min-h-0 space-y-2"
            >
              {historyLoading && (
                <p className="text-xs kawaify-text-muted animate-pulse text-center py-4">
                  {t("common.loading")}
                </p>
              )}
              {!historyLoading && messages.length === 0 && (
                <p className="text-sm kawaify-text-muted text-center py-2">
                  {t("assistant.placeholder")}
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "text-sm rounded-xl px-3 py-2 max-w-[92%]",
                    msg.role === "user"
                      ? "ml-auto fab-msg-user border"
                      : "mr-auto fab-msg-assistant border"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              ))}
              {loading && (
                <p className="text-xs kawaify-text-muted animate-pulse">
                  {t("assistant.thinking")}
                </p>
              )}
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0 border-t border-[var(--border)] pt-2">
              {CHIP_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={loading}
                  onClick={() => void submit(CHIP_PROMPTS[key])}
                  className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-pink-500/40 hover:text-[var(--text)] transition disabled:opacity-50"
                >
                  {t(key)}
                </button>
              ))}
            </div>

            <form
              className="px-3 pb-3 flex gap-2 shrink-0"
              onSubmit={(e) => {
                e.preventDefault();
                void submit(input);
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("assistant.placeholder")}
                disabled={loading}
                className="kawaify-input h-10 px-3 text-sm flex-1 min-w-0"
                aria-label={t("assistant.placeholder")}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={loading || !input.trim()}
                className="shrink-0 px-3"
                aria-label={t("assistant.ask")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={clsx(
          "fab-button pointer-events-auto h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-pink-500 to-purple-600 text-white",
          "flex items-center justify-center",
          "hover:scale-105 active:scale-95 transition-transform",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/60",
          open && "ring-2 ring-pink-400/40"
        )}
        aria-label={open ? t("common.close") : t("assistant.title")}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
      </button>
    </div>
  );
}
