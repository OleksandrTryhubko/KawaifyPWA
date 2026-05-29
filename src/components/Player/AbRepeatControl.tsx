import { type RefObject } from "react";
import { usePlayerStore } from "../../store/playerStore";
import clsx from "clsx";

interface AbRepeatControlProps {
  audio: RefObject<HTMLAudioElement>;
}

export default function AbRepeatControl({ audio }: AbRepeatControlProps) {
  const { abRepeat, setAbPointA, setAbPointB, clearAbRepeat, toggleAbRepeatActive } =
    usePlayerStore();

  const setA = () => {
    const t = audio.current?.currentTime ?? 0;
    setAbPointA(t);
  };

  const setB = () => {
    const t = audio.current?.currentTime ?? 0;
    setAbPointB(t);
  };

  const canActivate = abRepeat.pointA != null && abRepeat.pointB != null;

  return (
    <div className="flex items-center gap-1 text-[10px] sm:text-xs">
      <button
        type="button"
        onClick={setA}
        className={clsx(
          "px-2 py-0.5 rounded border transition",
          abRepeat.pointA != null
            ? "border-pink-500 text-pink-400 bg-pink-500/10"
            : "border-[var(--border)] text-[var(--text-muted)] hover:border-pink-500/40"
        )}
        title="Set point A"
      >
        A
      </button>
      <button
        type="button"
        onClick={setB}
        className={clsx(
          "px-2 py-0.5 rounded border transition",
          abRepeat.pointB != null
            ? "border-purple-500 text-purple-400 bg-purple-500/10"
            : "border-[var(--border)] text-[var(--text-muted)] hover:border-purple-500/40"
        )}
        title="Set point B"
      >
        B
      </button>
      {canActivate && (
        <button
          type="button"
          onClick={toggleAbRepeatActive}
          className={clsx(
            "px-2 py-0.5 rounded transition",
            abRepeat.active
              ? "bg-pink-500/20 text-pink-300"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          )}
        >
          A-B {abRepeat.active ? "ON" : "OFF"}
        </button>
      )}
      {(abRepeat.pointA != null || abRepeat.pointB != null) && (
        <button
          type="button"
          onClick={clearAbRepeat}
          className="px-1.5 text-[var(--text-muted)] hover:text-red-400 transition"
          title="Clear A-B"
        >
          ✕
        </button>
      )}
    </div>
  );
}
