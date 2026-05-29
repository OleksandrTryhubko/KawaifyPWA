import { useRef } from "react";
import { usePlayerStore } from "../../store/playerStore";
import { Slider } from "../Slider";

const VolumeIcon = () => (
  <svg fill="currentColor" height="18" width="18" viewBox="0 0 16 16" aria-hidden>
    <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z" />
    <path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z" />
  </svg>
);

const MutedIcon = () => (
  <svg fill="currentColor" height="18" width="18" viewBox="0 0 16 16" aria-hidden>
    <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z" />
    <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z" />
  </svg>
);

export default function VolumePanel() {
  const volume = usePlayerStore((s) => s.volume);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const previousVolumeRef = useRef(volume);
  const isMuted = volume < 0.01;
  const percent = Math.round(volume * 100);

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolumeRef.current || 0.5);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-[120px] max-w-[180px]">
      <button
        type="button"
        className="text-[var(--text-muted)] hover:text-[var(--text)] transition shrink-0"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MutedIcon /> : <VolumeIcon />}
      </button>
      <Slider
        max={100}
        min={0}
        value={[volume * 100]}
        className="flex-1 min-w-[60px]"
        onValueChange={([v]) => setVolume(v / 100)}
      />
      <span className="text-[10px] sm:text-xs tabular-nums text-[var(--text-muted)] w-8 shrink-0">
        {percent}%
      </span>
    </div>
  );
}
