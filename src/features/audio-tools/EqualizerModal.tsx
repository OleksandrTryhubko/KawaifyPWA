import { X } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import { useLanguage } from "../../hooks/useLanguage";
import { EQUALIZER_PRESETS } from "./equalizerPresets";
import EqGraph from "./EqGraph";
import AdvancedPlaybackSection from "../../components/Player/AdvancedPlaybackSection";
import { Slider } from "../../components/Slider";
import clsx from "clsx";

function formatFreq(f: number): string {
  if (f >= 1000) return `${f / 1000}k`;
  return String(f);
}

export default function EqualizerModal() {
  const {
    equalizerOpen,
    setEqualizerOpen,
    equalizerBands,
    equalizerMasterGain,
    equalizerPresetId,
    setEqualizerBand,
    setEqualizerMasterGain,
    applyEqualizerPreset,
  } = usePlayerStore();
  const { t } = useLanguage();

  if (!equalizerOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setEqualizerOpen(false)}
        aria-hidden
      />
      <div
        className="fixed inset-x-2 z-[70] w-auto sm:w-[min(640px,92vw)] max-h-[min(85vh,520px)] overflow-hidden kawaify-card border border-[var(--border)] shadow-2xl flex flex-col animate-scale-in left-1/2 -translate-x-1/2 bottom-[calc(var(--player-h-mobile)+0.5rem)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
        role="dialog"
        aria-label="Equalizer"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
          <h2 className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {t("eq.title")}
          </h2>
          <button
            type="button"
            onClick={() => setEqualizerOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="hidden md:block px-4 pt-3">
          <EqGraph bands={equalizerBands} />
        </div>

        <div className="px-3 py-2 flex flex-wrap gap-1.5 shrink-0 border-b border-[var(--border)] md:border-0">
          {EQUALIZER_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyEqualizerPreset(p.id)}
              className={clsx(
                "px-2.5 py-1 text-xs rounded-full border transition",
                equalizerPresetId === p.id
                  ? "border-pink-500 bg-pink-500/15 text-pink-300"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-pink-500/40"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Desktop: horizontal sliders */}
        <div className="hidden md:flex px-4 py-4 gap-2 items-end justify-between overflow-x-auto">
          {equalizerBands.map((band, i) => (
            <div key={band.frequency} className="flex flex-col items-center gap-2 min-w-[44px]">
              <span className="text-[10px] tabular-nums text-pink-400/80">
                {band.gain > 0 ? "+" : ""}
                {Math.round(band.gain)}
              </span>
              <VerticalSlider
                value={band.gain}
                onChange={(v) => setEqualizerBand(i, v)}
              />
              <span className="text-[10px] text-[var(--text-muted)]">{formatFreq(band.frequency)}</span>
            </div>
          ))}
        </div>

        {/* Mobile: large vertical sliders, scrollable */}
        <div className="md:hidden flex-1 overflow-y-auto px-4 py-3 space-y-4 max-h-[50vh]">
          {equalizerBands.map((band, i) => (
            <div key={band.frequency} className="flex items-center gap-3">
              <span className="text-xs font-medium w-10 text-[var(--text-muted)]">
                {formatFreq(band.frequency)}
              </span>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-xs w-8 text-right tabular-nums text-pink-400">
                  {band.gain > 0 ? "+" : ""}
                  {Math.round(band.gain)} dB
                </span>
                <Slider
                  value={[band.gain]}
                  min={-12}
                  max={12}
                  step={0.5}
                  className="flex-1 h-8"
                  onValueChange={([v]) => setEqualizerBand(i, v)}
                />
              </div>
            </div>
          ))}
        </div>

        <AdvancedPlaybackSection />

        <footer className="px-4 py-3 border-t border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] shrink-0 w-20">{t("eq.masterGain")}</span>
            <Slider
              value={[equalizerMasterGain * 100]}
              min={0}
              max={200}
              step={1}
              className="flex-1"
              onValueChange={([v]) => setEqualizerMasterGain(v / 100)}
            />
            <span className="text-xs tabular-nums w-10 text-right text-[var(--text-muted)]">
              {Math.round(equalizerMasterGain * 100)}%
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}

function VerticalSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value + 12) / 24) * 100;
  return (
    <div className="relative h-28 w-6 flex justify-center">
      <input
        type="range"
        min={-12}
        max={12}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="eq-vertical-slider absolute h-28 w-28 origin-center -rotate-90"
        aria-label="Band gain"
      />
      <div
        className="absolute bottom-0 w-1 rounded-full bg-gradient-to-t from-purple-600 to-pink-500 pointer-events-none"
        style={{ height: `${pct}%` }}
      />
    </div>
  );
}
