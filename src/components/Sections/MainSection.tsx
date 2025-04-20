import { useEffect, useState } from "react";
import { fetchAudiusTracks } from "../../api/audius";
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

const MainSection = () => {
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);

  useEffect(() => {
    fetchAudiusTracks("lofi", 12).then((res) => setTracks(res));
  }, []);

  return (
    <div
      id="playlist-container"
      className="relative transition-all duration-1000 bg-pink-400 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="relative z-10 px-6 pt-10">
        <Greeting />
        <div className="flex flex-wrap mt-6 gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="w-44 bg-zinc-800/60 hover:bg-zinc-800 transition p-2 rounded-md shadow-lg"
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
