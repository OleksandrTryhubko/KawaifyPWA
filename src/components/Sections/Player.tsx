import { useEffect, useRef } from "react";
import { usePlayerStore } from "../../store/playerStore";
import { Play } from "../Player/Play";
import { Pause } from "../Player/Pause";
import { VolumeControl } from "../Player/Volume";
import { CurrentSong, SongControl } from "../Player/Song";
import FavoriteButton from "../Player/FavoriteButton";
import AddToPlaylistButton from "../Player/AddToPlaylistButton";

const Player = () => {
  const { currentTrack, isPlaying, setIsPlaying, volume } = usePlayerStore((state) => ({
    currentTrack: state.currentTrack,
    isPlaying: state.isPlaying,
    setIsPlaying: state.setIsPlaying,
    volume: state.volume,
  }));

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    if (!audioRef.current.src) return;
    isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!currentTrack) return;

    audioRef.current.src = currentTrack.streamUrl;
    audioRef.current.load();
    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

  const handleClick = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full px-2 sm:px-4 py-2 gap-2 sm:gap-3 max-w-[100vw]">
      <div className="w-full sm:w-auto sm:min-w-[140px] sm:max-w-[220px] shrink-0 order-1 sm:order-none">
        {currentTrack ? (
          <CurrentSong {...currentTrack} />
        ) : (
          <div className="h-12 sm:h-16 flex items-center text-xs kawaify-text-muted px-1">
            No track selected
          </div>
        )}
      </div>

      <div className="flex flex-col items-center flex-1 gap-1 sm:gap-2 w-full min-w-0 order-3 sm:order-none">
        <div className="flex items-center gap-3 sm:gap-4">
          <FavoriteButton />
          <button
            type="button"
            className={`bg-white rounded-full p-2 shrink-0 focus-visible:ring-2 focus-visible:ring-pink-400/50 ${
              currentTrack ? "" : "opacity-50 pointer-events-none"
            }`}
            onClick={handleClick}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          <AddToPlaylistButton />
        </div>

        {currentTrack && <SongControl audio={audioRef} />}
        <audio ref={audioRef} />
      </div>

      <div className="hidden md:grid place-content-center order-2 sm:order-none shrink-0">
        <VolumeControl />
      </div>
    </div>
  );
};

export default Player;
