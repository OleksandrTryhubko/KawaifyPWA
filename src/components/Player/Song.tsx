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
    <div className="flex items-center gap-5 relative overflow-hidden">
      <div className="w-16 h-16 shrink-0">
        <TrackArtwork
          src={image}
          alt={title}
          className="!aspect-auto w-16 h-16 rounded-md"
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
    <div className="flex gap-x-3 text-xs pt-2">
      <span className="opacity-50 w-12 text-right">{formatTime(currentTime)}</span>

      <Slider
        value={[currentTime]}
        max={audio?.current?.duration ?? 0}
        min={0}
        className="w-[400px]"
        onValueChange={(value) => {
          const [newCurrentTime] = value;
          if (audio.current) audio.current.currentTime = newCurrentTime;
        }}
      />

      <span className="opacity-50 w-12">
        {duration ? formatTime(duration) : "0:00"}
      </span>
    </div>
  );
};
