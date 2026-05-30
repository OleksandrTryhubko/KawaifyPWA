import AbRepeatControl from "./AbRepeatControl";
import { useLanguage } from "../../hooks/useLanguage";

/** Uses shared audioElementRef inside AbRepeatControl */
export default function AdvancedPlaybackSection() {
  const { t } = useLanguage();

  return (
    <section className="px-4 py-3 border-t border-[var(--border)] shrink-0">
      <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
        {t("player.advancedPlayback")}
      </h3>
      <p className="text-[11px] kawaify-text-muted mb-2">{t("player.abRepeat")}</p>
      <AbRepeatControl />
    </section>
  );
}
