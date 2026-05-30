import { usePlayerStore } from "../../store/playerStore";
import { audioElementRef } from "../../lib/audioElementRef";
import clsx from "clsx";

export default function AbRepeatControl() {
  const { abRepeat, setAbPointA, setAbPointB, clearAbRepeat, toggleAbRepeatActive } =
    usePlayerStore();

  const setA = () => {
    const t = audioElementRef.current?.currentTime ?? 0;
    setAbPointA(t);
  };

  const setB = () => {
    const t = audioElementRef.current?.currentTime ?? 0;
    setAbPointB(t);
  };

  const canActivate = abRepeat.pointA != null && abRepeat.pointB != null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <button
        type="button"
        onClick={setA}
        className={clsx(
          "px-3 py-1.5 rounded-lg border transition min-h-[36px]",
          abRepeat.pointA != null
            ? "border-pink-500 text-pink-400 bg-pink-500/10"
            : "border-[var(--border)] text-[var(--text-muted)] hover:border-pink-500/40"
        )}
      >
        A
      </button>
      <button
        type="button"
        onClick={setB}
        className={clsx(
          "px-3 py-1.5 rounded-lg border transition min-h-[36px]",
          abRepeat.pointB != null
            ? "border-purple-500 text-purple-400 bg-purple-500/10"
            : "border-[var(--border)] text-[var(--text-muted)] hover:border-purple-500/40"
        )}
      >
        B
      </button>
      {canActivate && (
        <button
          type="button"
          onClick={toggleAbRepeatActive}
          className={clsx(
            "px-3 py-1.5 rounded-lg transition min-h-[36px]",
            abRepeat.active
              ? "bg-pink-500/20 text-pink-300"
              : "text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
          )}
        >
          A-B {abRepeat.active ? "ON" : "OFF"}
        </button>
      )}
      {(abRepeat.pointA != null || abRepeat.pointB != null) && (
        <button
          type="button"
          onClick={clearAbRepeat}
          className="px-2 py-1.5 text-[var(--text-muted)] hover:text-red-400 transition min-h-[36px]"
        >
          ✕
        </button>
      )}
    </div>
  );
}
