import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { useToast } from "../../hooks/useToast";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import {
  clearAssistantHistory,
  getAssistantStats,
  type AssistantStats,
} from "../../services/assistantService";

export default function AssistantAccountBlock() {
  const { user, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();
  const [stats, setStats] = useState<AssistantStats>({ totalMessages: 0, lastUsedAt: null });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getAssistantStats(user.uid)
      .then(setStats)
      .catch(() => setStats({ totalMessages: 0, lastUsedAt: null }));
  }, [user?.uid]);

  const formatDate = (d: Date | null) => {
    if (!d) return t("assistant.never");
    return d.toLocaleString(language === "uk" ? "uk-UA" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleClear = async () => {
    if (!user?.uid) return;
    setBusy(true);
    try {
      await clearAssistantHistory(user.uid);
      setStats({ totalMessages: 0, lastUsedAt: null });
      await refreshUser();
      toast.success(t("assistant.clearSuccess"));
    } catch {
      toast.error(t("assistant.clearError"));
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="kawaify-card p-5 sm:p-6">
        <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          {t("assistant.accountTitle")}
        </h2>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="kawaify-text-muted">{t("assistant.totalMessages")}</dt>
            <dd className="text-xl font-semibold text-[var(--text)] mt-0.5">
              {stats.totalMessages}
            </dd>
          </div>
          <div>
            <dt className="kawaify-text-muted">{t("assistant.lastUsed")}</dt>
            <dd className="text-sm text-[var(--text)] mt-0.5">{formatDate(stats.lastUsedAt)}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={busy || stats.totalMessages === 0}
          >
            {t("assistant.clearHistory")}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("assistant.clearHistory")}
        message={t("assistant.clearConfirm")}
        confirmLabel={t("common.delete")}
        busy={busy}
        onConfirm={() => void handleClear()}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
