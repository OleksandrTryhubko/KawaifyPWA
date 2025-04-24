import { useEffect, useState } from "react";
import { fetchAudiusTracks } from "../../api/audius";
import { usePlayerStore } from "../../store/playerStore";
import Greeting from "../Greeting";

interface AudiusTrack {
  id: string;
  title: string;
  duration: number;
  stream_url: string;
  artwork: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  user: {
    name: string;
  };
}

const GENRES = ["lofi", "hip-hop", "pop", "rock", "dance", "ambient", "jazz", "chillwave"];

const genreColors: { [key: string]: string } = {
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
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    fetchAudiusTracks(selectedGenre, 48).then((res) => setTracks(res));
  }, [selectedGenre]);

  const handlePlay = (track: AudiusTrack) => {
    setCurrentTrack({
      id: track.id,
      title: track.title,
      artists: [track.user.name],
      genre: selectedGenre,
      duration: String(track.duration ?? "0:00"),
      image:
        track.artwork?.["480x480"] ||
        track.artwork?.["150x150"] ||
        "/fallback.jpg",
      streamUrl: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=kawaify`,
      source: "audius",
    });
    setIsPlaying(true);
  };

  return (
    <div
      id="playlist-container"
      className="relative transition-all duration-1000 bg-pink-400 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="relative z-10 px-6 pt-10">
        <Greeting />

        {/* Genre Buttons */}
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

        {/* Tracks */}
        <div className="flex flex-wrap gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="w-44 bg-zinc-800/60 hover:bg-zinc-800 transition p-2 rounded-md shadow-lg cursor-pointer"
              onClick={() => handlePlay(track)}
            >
              <img
                src={
                  track.artwork?.["480x480"] ||
                  track.artwork?.["150x150"] ||
                  "/fallback.jpg"
                }
                alt={`Cover of ${track.title}`}
                className="rounded-md w-full h-auto aspect-square object-cover"
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

      {/* Градієнт */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-zinc-900 via-purple-900/80 to-transparent z-0" />
    </div>
  );
};

export default MainSection;
