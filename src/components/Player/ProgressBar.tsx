import { useRef } from "react";
import { usePlayerStore } from "../../store/playerStore";
import { audioElementRef } from "../../lib/audioElementRef";
import { Slider } from "../Slider";

interface ProgressBarProps {
  className?: string;
}

function formatTime(time: number): string {
  if (!Number.isFinite(time) || time < 0) return "0:00";
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ProgressBar({ className = "" }: ProgressBarProps) {
  const currentTime = usePlayerStore((s) => s.playbackCurrentTime);
  const duration = usePlayerStore((s) => s.playbackDuration);
  const setPlaybackProgress = usePlayerStore((s) => s.setPlaybackProgress);

  const seekingRef = useRef(false);

  const max = duration > 0 ? duration : 100;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 w-full min-w-0 ${className}`}>
      <span className="text-[10px] sm:text-xs tabular-nums text-[var(--text-muted)] w-9 sm:w-10 text-right shrink-0">
        {formatTime(currentTime)}
      </span>

      <div className="flex-1 min-w-0 relative group">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pink-500/70 to-purple-500/70 pointer-events-none transition-[width] duration-75 ease-linear"
          style={{
            width: `${progress}%`,
            top: "50%",
            height: 3,
            transform: "translateY(-50%)",
          }}
          aria-hidden
        />
        <Slider
          value={[currentTime]}
          max={max}
          min={0}
          step={0.1}
          className="player-progress-slider w-full"
          onValueChange={(value) => {
            const [t] = value;
            seekingRef.current = true;
            setPlaybackProgress(t, duration);
            const audio = audioElementRef.current;
            if (audio) audio.currentTime = t;
          }}
          onValueCommit={() => {
            seekingRef.current = false;
            const audio = audioElementRef.current;
            if (audio) {
              setPlaybackProgress(audio.currentTime, duration);
            }
          }}
        />
      </div>

      <span className="text-[10px] sm:text-xs tabular-nums text-[var(--text-muted)] w-9 sm:w-10 shrink-0">
        {formatTime(duration)}
      </span>
    </div>
  );
}
