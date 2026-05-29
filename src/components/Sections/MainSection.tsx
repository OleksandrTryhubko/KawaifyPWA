import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  fetchAudiusTracks,
  formatAudiusDuration,
  getAudiusArtworkUrl,
  getAudiusStreamUrl,
} from "../../api/audius";
import type { AudiusTrack } from "../../types/audius";
import { useAuth } from "../../hooks/useAuth";
import { usePlayerStore } from "../../store/playerStore";
import Greeting from "../Greeting";
import TrackCard from "../common/TrackCard";
import Button from "../ui/Button";
import RecentlyPlayedSection from "../home/RecentlyPlayedSection";
import { sortByKey, type SortDirection } from "../../utils/sortHelpers";

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

type SearchSort =
  | "relevance"
  | "name-asc"
  | "name-desc"
  | "artist-asc"
  | "artist-desc";

type FilterField = "all" | "title" | "artist" | "genre";

const MainSection = () => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [activePreset, setActivePreset] = useState<string>("lofi");
  const [searchText, setSearchText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchSort, setSearchSort] = useState<SearchSort>("relevance");
  const [filterField, setFilterField] = useState<FilterField>("all");
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

  const filteredTracks = useMemo(() => {
    const q = debounced.toLowerCase();
    if (!q) return tracks;

    return tracks.filter((track) => {
      const title = track.title.toLowerCase();
      const artist = track.user?.name?.toLowerCase() ?? "";
      const genre = track.genre?.toLowerCase() ?? "";

      if (filterField === "title") return title.includes(q);
      if (filterField === "artist") return artist.includes(q);
      if (filterField === "genre") return genre.includes(q);
      return title.includes(q) || artist.includes(q) || genre.includes(q);
    });
  }, [tracks, debounced, filterField]);

  const displayTracks = useMemo(() => {
    if (searchSort === "relevance") return filteredTracks;
    const dir: SortDirection = searchSort.endsWith("desc") ? "desc" : "asc";
    if (searchSort.startsWith("artist")) {
      return sortByKey(filteredTracks, (t) => t.user?.name ?? "", dir);
    }
    return sortByKey(filteredTracks, (t) => t.title, dir);
  }, [filteredTracks, searchSort]);

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
    setSearchSort("relevance");
  };

  const clearSearch = () => {
    setSearchText("");
    setFilterField("all");
    setSearchSort("relevance");
  };

  return (
    <div
      id="playlist-container"
      className="home-shell relative transition-all duration-300 rounded-lg overflow-hidden"
    >
      <div className="relative z-10 px-4 sm:px-6 pt-6 sm:pt-10 pb-6">
        <Greeting />

        {user && <RecentlyPlayedSection />}

        <div className="mt-5 mb-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="flex-1 min-w-0 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none"
                aria-hidden
              />
              <div className="kawaify-input h-11 pl-10 pr-3 shadow-sm flex items-center">
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search tracks, artists…"
                  className="w-full bg-transparent outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                  aria-label="Search tracks"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={clearSearch}
              disabled={isLoading || (searchText.length === 0 && filterField === "all")}
              className="sm:min-w-[100px] shrink-0"
              leftIcon={<X className="h-4 w-4" />}
            >
              Clear
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value as FilterField)}
              className="kawaify-input h-9 px-2 text-xs flex-1 min-w-[120px] sm:flex-none sm:w-auto"
              aria-label="Filter by"
            >
              <option value="all">All fields</option>
              <option value="title">Track name</option>
              <option value="artist">Artist</option>
              <option value="genre">Genre</option>
            </select>
            <select
              value={searchSort}
              onChange={(e) => setSearchSort(e.target.value as SearchSort)}
              className="kawaify-input h-9 px-2 text-xs flex-1 min-w-[120px] sm:flex-none sm:w-auto"
              aria-label="Sort results"
            >
              <option value="relevance">Relevance</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="artist-asc">Artist A-Z</option>
              <option value="artist-desc">Artist Z-A</option>
            </select>
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
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="kawaify-card h-40 animate-pulse bg-[var(--surface-soft)]/50"
              />
            ))}
          </div>
        )}

        {!isLoading && !loadError && displayTracks.length === 0 && (
          <div className="mb-4 home-notice rounded-xl p-5">
            <p className="font-semibold text-[var(--text)]">Нічого не знайдено</p>
            <p className="text-sm mt-1 kawaify-text-muted">
              Спробуй інший запит, фільтр або вибери жанр.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-2">
          {!isLoading &&
            displayTracks.map((track) => (
              <TrackCard
                key={track.id}
                title={track.title}
                artist={track.user.name}
                image={getAudiusArtworkUrl(track.artwork)}
                onPlay={() => handlePlay(track)}
                showPlayButton
              />
            ))}
        </div>
      </div>

      <div className="home-shell-overlay absolute inset-0 rounded-lg z-0" />
    </div>
  );
};

export default MainSection;
