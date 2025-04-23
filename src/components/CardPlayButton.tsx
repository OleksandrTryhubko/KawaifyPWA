import { Play } from "./Player/Play";
import { Pause } from "./Player/Pause";
import { usePlayerStore } from "../store/playerStore";

interface SimplePlayButtonProps {
  size?: "small" | "large";
  onClickPlay?: () => void;
}

const SimplePlayButton = ({ size = "small", onClickPlay }: SimplePlayButtonProps) => {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayPause = usePlayerStore((state) => state.togglePlayPause);

  const handleClick = () => {
    togglePlayPause();
    if (onClickPlay) onClickPlay();
  };

  const iconClassName = size === "small" ? "w-4 h-4" : "w-6 h-6";

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-pink-200 p-3 sm:p-4 mb-6 sm:mb-10 hover:scale-105 transition hover:bg-pink-500"
    >
      {isPlaying ? <Pause className={iconClassName} /> : <Play className={iconClassName} />}
    </button>
  );
};

export default SimplePlayButton;
