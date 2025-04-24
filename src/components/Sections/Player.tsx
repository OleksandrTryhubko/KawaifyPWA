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
    <div className="flex flex-col sm:flex-row items-center justify-between w-full px-2 py-2 gap-2 sm:gap-0 z-50 bg-zinc-900 rounded-lg shadow-md">
      <div className="w-[200px]">
        {currentTrack && <CurrentSong {...currentTrack} />}
      </div>

      <div className="flex flex-col items-center flex-1 gap-2">
        <div className="flex items-center gap-4">
          <FavoriteButton />
          <button
            className={`bg-white rounded-full p-2 ${
              currentTrack ? "" : "opacity-50 pointer-events-none"
            }`}
            onClick={handleClick}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <AddToPlaylistButton />
        </div>

        {currentTrack && <SongControl audio={audioRef} />}
        <audio ref={audioRef} />
      </div>

      <div className="grid place-content-center">
        <VolumeControl />
      </div>
    </div>
  );
};

export default Player;