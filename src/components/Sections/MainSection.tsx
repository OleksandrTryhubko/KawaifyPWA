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
import TrackCard from "../common/TrackCard";
import Button from "../ui/Button";

const GENRES = [
  "lofi",
  "hip-hop",
  "pop",
  "rock",
  "dance",
  "ambient",
  "jazz",
  "chillwave",
  "phonk",
  "electronic",
];

const genreColors: Record<string, string> = {
  lofi: "from-pink-600 to-pink-500",
  "hip-hop": "from-purple-600 to-purple-500",
  pop: "from-red-600 to-red-500",
  rock: "from-pink-500 to-rose-400",
  dance: "from-orange-500 to-yellow-500",
  ambient: "from-zinc-600 to-zinc-500",
  jazz: "from-yellow-600 to-amber-500",
  chillwave: "from-blue-500 to-cyan-400",
  phonk: "from-fuchsia-600 to-indigo-600",
  electronic: "from-violet-600 to-sky-500",
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
      className="home-shell relative transition-all duration-300 rounded-lg overflow-hidden"
    >
      <div className="relative z-10 px-4 sm:px-6 pt-6 sm:pt-10 pb-6">
        <Greeting />

        <div className="mt-5 mb-5 flex flex-col sm:flex-row gap-2 items-stretch">
          <div className="flex-1 min-w-0">
            <div className="kawaify-input h-11 px-4 shadow-sm flex items-center">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search tracks…"
                className="w-full bg-transparent outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            <p className="text-xs text-white/70 mt-2 hidden sm:block">
              Genre buttons — швидкі preset-запити. Пошук — текстом, з debounce.
            </p>
          </div>
          <div className="sm:w-[108px]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setSearchText("")}
              disabled={isLoading || searchText.length === 0}
              fullWidth
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
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
          <div className="mb-4 home-notice home-notice-error rounded-xl p-4">
            <p className="text-sm">{loadError}</p>
          </div>
        )}

        {isLoading && (
          <p className="text-sm mb-4 kawaify-text-muted">Loading…</p>
        )}

        {!isLoading && !loadError && tracks.length === 0 && (
          <div className="mb-4 home-notice rounded-xl p-5">
            <p className="font-semibold text-[var(--text)]">Нічого не знайдено</p>
            <p className="text-sm mt-1 kawaify-text-muted">
              Спробуй інший запит або вибери жанр.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-2">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              title={track.title}
              artist={track.user.name}
              image={getAudiusArtworkUrl(track.artwork)}
              onPlay={() => handlePlay(track)}
            />
          ))}
        </div>
      </div>

      <div className="home-shell-overlay absolute inset-0 rounded-lg z-0" />
    </div>
  );
};

export default MainSection;
