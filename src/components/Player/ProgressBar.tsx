import { useEffect, useState, type RefObject } from "react";
import { Slider } from "../Slider";

interface ProgressBarProps {
  audio: RefObject<HTMLAudioElement>;
  className?: string;
}

function formatTime(time: number): string {
  if (!Number.isFinite(time) || time < 0) return "0:00";
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ProgressBar({ audio, className = "" }: ProgressBarProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;

    const onTimeUpdate = () => {
      if (!seeking) setCurrentTime(el.currentTime);
    };
    const onLoaded = () => setDuration(el.duration || 0);
    const onDurationChange = () => setDuration(el.duration || 0);

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("durationchange", onDurationChange);
    onLoaded();

    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("durationchange", onDurationChange);
    };
  }, [audio, seeking]);

  const max = duration > 0 ? duration : 100;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 w-full min-w-0 ${className}`}>
      <span className="text-[10px] sm:text-xs tabular-nums text-[var(--text-muted)] w-9 sm:w-10 text-right shrink-0">
        {formatTime(currentTime)}
      </span>

      <div className="flex-1 min-w-0 relative group">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-500/40 to-purple-500/40 pointer-events-none transition-all duration-150 ease-out"
          style={{ width: `${progress}%`, top: "50%", height: 3, transform: "translateY(-50%)" }}
          aria-hidden
        />
        <Slider
          value={[seeking ? currentTime : currentTime]}
          max={max}
          min={0}
          step={0.1}
          className="player-progress-slider w-full"
          onValueChange={(value) => {
            const [t] = value;
            setSeeking(true);
            setCurrentTime(t);
            if (audio.current) audio.current.currentTime = t;
          }}
          onValueCommit={() => setSeeking(false)}
        />
      </div>

      <span className="text-[10px] sm:text-xs tabular-nums text-[var(--text-muted)] w-9 sm:w-10 shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
}
