import { useEffect, useState } from "react";
import {
  fetchAudiusTracks,
  formatAudiusDuration,
  getAudiusArtworkUrl,
  getAudiusStreamUrl,
} from "../../api/audius";
import type { AudiusTrack } from "../../types/audius";
import { usePlayerStore } from "../../store/playerStore";
import Greeting from "../Greeting";
import TrackArtwork from "../common/TrackArtwork";

const GENRES = ["lofi", "hip-hop", "pop", "rock", "dance", "ambient", "jazz", "chillwave"];

const genreColors: Record<string, string> = {
  lofi: "from-pink-600 to-pink-500",
  "hip-hop": "from-purple-600 to-purple-500",
  pop: "from-red-600 to-red-500",
  rock: "from-pink-500 to-rose-400",
  dance: "from-orange-500 to-yellow-500",
  ambient: "from-zinc-600 to-zinc-500",
  jazz: "from-yellow-600 to-amber-500",
  chillwave: "from-blue-500 to-cyan-400",
};

const MainSection = () => {
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("lofi");
  const [loadError, setLoadError] = useState(false);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    setLoadError(false);
    fetchAudiusTracks(selectedGenre, 48)
      .then((res) => setTracks(res))
      .catch(() => {
        setTracks([]);
        setLoadError(true);
      });
  }, [selectedGenre]);

  const handlePlay = (track: AudiusTrack) => {
    setCurrentTrack({
      id: track.id,
      title: track.title,
      artists: [track.user.name],
      genre: selectedGenre,
      duration: formatAudiusDuration(track.duration),
      image: getAudiusArtworkUrl(track.artwork),
      streamUrl: getAudiusStreamUrl(track.id),
      source: "audius",
    });
    setIsPlaying(true);
  };

  return (
    <div
      id="playlist-container"
      className="relative transition-all duration-1000 bg-pink-400 rounded-lg overflow-hidden"
    >
      <div className="relative z-10 px-6 pt-10">
        <Greeting />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6 mb-6">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`h-12 w-full rounded-lg font-semibold capitalize
                bg-gradient-to-r ${genreColors[g] || "from-zinc-700 to-zinc-600"} 
                shadow-md border border-white/10 transition-all duration-200
                flex items-center justify-center text-white
                ${g === selectedGenre ? "opacity-100 scale-105" : "opacity-70 hover:opacity-100"}`}
            >
              {g}
            </button>
          ))}
        </div>

        {loadError && (
          <p className="text-pink-200 text-sm mb-4">
            Не вдалося завантажити треки. Спробуй інший жанр.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-zinc-800/60 hover:bg-zinc-800 transition p-2 rounded-md shadow-lg cursor-pointer"
              onClick={() => handlePlay(track)}
            >
              <TrackArtwork
                src={getAudiusArtworkUrl(track.artwork)}
                alt={`Cover of ${track.title}`}
              />
              <div className="mt-2 text-white text-sm font-semibold truncate">
                {track.title}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {track.user.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-zinc-900 via-purple-900/80 to-transparent z-0" />
    </div>
  );
};

export default MainSection;
