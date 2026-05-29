import {
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  ListMusic,
  SlidersHorizontal,
} from "lucide-react";
import { Play } from "./Play";
import { Pause } from "./Pause";
import { usePlayerStore } from "../../store/playerStore";
import clsx from "clsx";

interface PlayerControlsProps {
  onTogglePlay: () => void;
  disabled?: boolean;
}

export default function PlayerControls({ onTogglePlay, disabled }: PlayerControlsProps) {
  const {
    isPlaying,
    shuffleEnabled,
    repeatMode,
    toggleShuffle,
    cycleRepeatMode,
    playNext,
    playPrevious,
    setQueuePanelOpen,
    setEqualizerOpen,
  } = usePlayerStore();

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
      <ControlBtn
        onClick={toggleShuffle}
        active={shuffleEnabled}
        label="Shuffle"
        disabled={disabled}
      >
        <Shuffle className="h-4 w-4" />
      </ControlBtn>

      <ControlBtn onClick={playPrevious} label="Previous" disabled={disabled}>
        <SkipBack className="h-5 w-5" fill="currentColor" />
      </ControlBtn>

      <button
        type="button"
        className={clsx(
          "bg-white text-black rounded-full p-2.5 sm:p-3 shrink-0",
          "hover:scale-105 active:scale-95 transition-transform",
          "focus-visible:ring-2 focus-visible:ring-pink-400/60",
          disabled && "opacity-40 pointer-events-none"
        )}
        onClick={onTogglePlay}
        disabled={disabled}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Play className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      <ControlBtn onClick={playNext} label="Next" disabled={disabled}>
        <SkipForward className="h-5 w-5" fill="currentColor" />
      </ControlBtn>

      <ControlBtn
        onClick={cycleRepeatMode}
        active={repeatMode !== "off"}
        label={`Repeat: ${repeatMode}`}
        disabled={disabled}
      >
        {repeatMode === "track" ? (
          <Repeat1 className="h-4 w-4" />
        ) : (
          <Repeat className="h-4 w-4" />
        )}
      </ControlBtn>

      <ControlBtn onClick={() => setQueuePanelOpen(true)} label="Queue" disabled={disabled}>
        <ListMusic className="h-4 w-4" />
      </ControlBtn>

      <ControlBtn onClick={() => setEqualizerOpen(true)} label="Equalizer">
        <SlidersHorizontal className="h-4 w-4" />
      </ControlBtn>
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  active,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={clsx(
        "p-2 rounded-full transition-colors",
        "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-pink-400/40",
        active ? "text-pink-400" : "text-[var(--text-muted)] hover:text-[var(--text)]",
        disabled && "opacity-40 pointer-events-none"
      )}
    >
      {children}
    </button>
  );
}
