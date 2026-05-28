import { useEffect, useState, type RefObject } from "react";
import { Slider } from "../Slider";
import TrackArtwork from "../common/TrackArtwork";

interface CurrentSongProps {
  image: string;
  title: string;
  artists: string[];
}

interface SongControlProps {
  audio: RefObject<HTMLAudioElement>;
}

export const CurrentSong = ({ image, title, artists }: CurrentSongProps) => {
  return (
    <div className="flex items-center gap-3 sm:gap-4 relative overflow-hidden min-w-0">
      <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
        <TrackArtwork
          src={image}
          alt={title}
          className="!aspect-auto w-12 h-12 sm:w-16 sm:h-16 rounded-md"
          size="sm"
        />
      </div>

      <div className="flex flex-col min-w-0">
        <h3 className="font-semibold text-sm block truncate">{title}</h3>
        <span className="text-xs opacity-80 truncate">{artists?.join(", ")}</span>
      </div>
    </div>
  );
};

export const SongControl = ({ audio }: SongControlProps) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const el = audio.current;
    if (!el) return;

    const handleTimeUpdate = () => setCurrentTime(el.currentTime);
    el.addEventListener("timeupdate", handleTimeUpdate);
    return () => el.removeEventListener("timeupdate", handleTimeUpdate);
  }, [audio]);

  const formatTime = (time: number) => {
    if (time == null || !Number.isFinite(time)) return "0:00";
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const duration = audio?.current?.duration ?? 0;

  return (
    <div className="flex gap-x-2 sm:gap-x-3 text-xs pt-1 sm:pt-2 w-full max-w-full px-1">
      <span className="opacity-50 w-9 sm:w-12 text-right shrink-0">{formatTime(currentTime)}</span>

      <Slider
        value={[currentTime]}
        max={audio?.current?.duration ?? 0}
        min={0}
        className="flex-1 min-w-0 max-w-[400px]"
        onValueChange={(value) => {
          const [newCurrentTime] = value;
          if (audio.current) audio.current.currentTime = newCurrentTime;
        }}
      />

      <span className="opacity-50 w-9 sm:w-12 shrink-0">
        {duration ? formatTime(duration) : "0:00"}
      </span>
    </div>
  );
};
