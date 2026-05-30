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
import FavoriteButton from "./FavoriteButton";
import AddToPlaylistButton from "./AddToPlaylistButton";
import { usePlayerStore } from "../../store/playerStore";
import { useLanguage } from "../../hooks/useLanguage";
import clsx from "clsx";

interface PlayerControlsProps {
  onTogglePlay: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function PlayerControls({
  onTogglePlay,
  disabled,
  compact,
}: PlayerControlsProps) {
  const { t } = useLanguage();
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

  const iconClass = compact ? "h-4 w-4" : "h-[18px] w-[18px]";
  const playClass = compact ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6";
  const btnPad = compact
    ? "min-w-[40px] min-h-[40px]"
    : "min-w-[44px] min-h-[44px]";

  const repeatLabel =
    repeatMode === "track"
      ? t("player.repeatTrack")
      : repeatMode === "playlist"
        ? t("player.repeatPlaylist")
        : t("player.repeatOff");

  return (
    <div
      className={clsx(
        "player-controls flex items-center justify-center max-w-full",
        compact ? "gap-0.5" : "gap-0.5 sm:gap-1"
      )}
    >
      <FavoriteButton iconSize={compact ? 18 : 20} />

      <ControlBtn
        onClick={toggleShuffle}
        active={shuffleEnabled}
        label={t("player.shuffle")}
        disabled={disabled}
        className={btnPad}
      >
        <Shuffle className={iconClass} />
      </ControlBtn>

      <ControlBtn
        onClick={playPrevious}
        label={t("player.previous")}
        disabled={disabled}
        className={btnPad}
      >
        <SkipBack className={compact ? "h-4 w-4" : "h-5 w-5"} fill="currentColor" />
      </ControlBtn>

      <button
        type="button"
        className={clsx(
          "player-play-btn inline-flex items-center justify-center bg-white text-black rounded-full shrink-0",
          "hover:scale-105 active:scale-95 transition-transform",
          "focus-visible:ring-2 focus-visible:ring-pink-400/60",
          compact ? "min-w-[44px] min-h-[44px] p-2" : "min-w-[48px] min-h-[48px] p-2.5 sm:p-3",
          disabled && "opacity-40 pointer-events-none"
        )}
        onClick={onTogglePlay}
        disabled={disabled}
        aria-label={isPlaying ? t("player.pause") : t("player.play")}
      >
        {isPlaying ? <Pause className={playClass} /> : <Play className={playClass} />}
      </button>

      <ControlBtn
        onClick={playNext}
        label={t("player.next")}
        disabled={disabled}
        className={btnPad}
      >
        <SkipForward className={compact ? "h-4 w-4" : "h-5 w-5"} fill="currentColor" />
      </ControlBtn>

      <ControlBtn
        onClick={cycleRepeatMode}
        active={repeatMode !== "off"}
        label={repeatLabel}
        disabled={disabled}
        className={btnPad}
      >
        {repeatMode === "track" ? (
          <Repeat1 className={iconClass} />
        ) : (
          <Repeat className={iconClass} />
        )}
      </ControlBtn>

      <ControlBtn
        onClick={() => setQueuePanelOpen(true)}
        label={t("player.queue")}
        disabled={disabled}
        className={btnPad}
      >
        <ListMusic className={iconClass} />
      </ControlBtn>

      <ControlBtn
        onClick={() => setEqualizerOpen(true)}
        label={t("player.equalizer")}
        className={btnPad}
      >
        <SlidersHorizontal className={iconClass} />
      </ControlBtn>

      <AddToPlaylistButton />
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  active,
  label,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={clsx(
        "inline-flex items-center justify-center rounded-full p-2 transition-colors",
        "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-pink-400/40",
        active ? "text-pink-400" : "text-[var(--text-muted)] hover:text-[var(--text)]",
        disabled && "opacity-40 pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}
