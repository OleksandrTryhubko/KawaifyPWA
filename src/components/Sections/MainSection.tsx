import { useEffect, useMemo, useState } from "react";
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
import Button from "../ui/Button";

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
  const [activePreset, setActivePreset] = useState<string>("lofi");
  const [searchText, setSearchText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchText.trim()), 350);
    return () => clearTimeout(t);
  }, [searchText]);

  const effectiveQuery = useMemo(() => {
    if (debounced.length > 0) return debounced;
    return activePreset || "lofi";
  }, [debounced, activePreset]);

  useEffect(() => {
    let cancelled = false;

    setLoadError(null);
    setIsLoading(true);

    fetchAudiusTracks(effectiveQuery, 48)
      .then((res) => {
        if (cancelled) return;
        setTracks(res);
      })
      .catch(() => {
        if (cancelled) return;
        setTracks([]);
        setLoadError("Audius недоступний. Спробуй ще раз трохи пізніше.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveQuery]);

  const handlePlay = (track: AudiusTrack) => {
    setCurrentTrack({
      id: track.id,
      title: track.title,
      artists: [track.user.name],
      genre: debounced && debounced !== activePreset ? "" : activePreset,
      duration: formatAudiusDuration(track.duration),
      image: getAudiusArtworkUrl(track.artwork),
      streamUrl: getAudiusStreamUrl(track.id),
      source: "audius",
    });
    setIsPlaying(true);
  };

  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    setSearchText(preset);
  };

  return (
    <div
      id="playlist-container"
      className="relative transition-all duration-1000 bg-pink-400 rounded-lg overflow-hidden"
    >
      <div className="relative z-10 px-6 pt-10">
        <Greeting />

        <div className="mt-6 mb-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1">
            <div className="bg-zinc-900/70 border border-pink-500/10 rounded-xl px-4 py-3 shadow-md">
              <input
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (e.target.value.trim().length > 0 && e.target.value.trim() !== activePreset) {
                    // keep preset as a quick label; search drives the query
                  }
                }}
                placeholder="Search tracks…"
                className="w-full bg-transparent outline-none text-white placeholder:text-zinc-400"
              />
            </div>
            <p className="text-xs text-white/70 mt-2">
              Genre buttons — швидкі preset-запити. Пошук — текстом, з debounce.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setSearchText("")}
              disabled={isLoading || searchText.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
          {GENRES.map((g) => (
            <Button
              key={g}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handlePresetClick(g)}
              className={`h-11 w-full rounded-lg font-semibold capitalize
                bg-gradient-to-r ${genreColors[g] || "from-zinc-700 to-zinc-600"}
                border border-white/10 shadow-md
                ${g === activePreset ? "opacity-100 scale-[1.02]" : "opacity-80 hover:opacity-100"}
              `}
            >
              {g}
            </Button>
          ))}
        </div>

        {loadError && (
          <div className="mb-4 bg-zinc-900/70 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-200 text-sm">{loadError}</p>
          </div>
        )}

        {isLoading && (
          <p className="text-white/80 text-sm mb-4">Loading…</p>
        )}

        {!isLoading && !loadError && tracks.length === 0 && (
          <div className="mb-4 bg-zinc-900/70 border border-purple-500/20 rounded-xl p-5">
            <p className="text-pink-200 font-semibold">Нічого не знайдено</p>
            <p className="text-zinc-400 text-sm mt-1">
              Спробуй інший запит або вибери жанр.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="group bg-zinc-800/60 hover:bg-zinc-800 transition p-3 rounded-xl shadow-lg cursor-pointer border border-white/5 hover:border-pink-500/20"
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
