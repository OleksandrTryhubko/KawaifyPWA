import { useCallback, useEffect, useMemo, useState } from "react";
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
import { fetchRandomRecommendations } from "../../utils/audiusRecommendations";

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
  const [shownIds, setShownIds] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchSort, setSearchSort] = useState<SearchSort>("relevance");
  const [filterField, setFilterField] = useState<FilterField>("all");
  const { playTrack } = usePlayerStore();

  const isSearchMode = debounced.length > 0;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchText.trim()), 350);
    return () => clearTimeout(t);
  }, [searchText]);

  const loadRecommendations = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const res = await fetchRandomRecommendations(24);
      setTracks(res);
      setShownIds(res.map((t) => t.id));
    } catch {
      setTracks([]);
      setLoadError("Audius недоступний. Спробуй ще раз трохи пізніше.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSearch = useCallback(async (query: string) => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const res = await fetchAudiusTracks(query, 48);
      setTracks(res);
      setShownIds(res.map((t) => t.id));
    } catch {
      setTracks([]);
      setLoadError("Audius недоступний. Спробуй ще раз трохи пізніше.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSearchMode) {
      loadSearch(debounced);
    } else {
      loadRecommendations();
    }
  }, [debounced, isSearchMode, loadRecommendations, loadSearch]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const more = await fetchRandomRecommendations(20, shownIds);
      if (more.length > 0) {
        setTracks((prev) => [...prev, ...more]);
        setShownIds((prev) => [...prev, ...more.map((t) => t.id)]);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filteredTracks = useMemo(() => {
    const q = debounced.toLowerCase();
    if (!q || !isSearchMode) return tracks;

    return tracks.filter((track) => {
      const title = track.title.toLowerCase();
      const artist = track.user?.name?.toLowerCase() ?? "";
      const genre = track.genre?.toLowerCase() ?? "";

      if (filterField === "title") return title.includes(q);
      if (filterField === "artist") return artist.includes(q);
      if (filterField === "genre") return genre.includes(q);
      return title.includes(q) || artist.includes(q) || genre.includes(q);
    });
  }, [tracks, debounced, filterField, isSearchMode]);

  const displayTracks = useMemo(() => {
    if (searchSort === "relevance" || !isSearchMode) return filteredTracks;
    const dir: SortDirection = searchSort.endsWith("desc") ? "desc" : "asc";
    if (searchSort.startsWith("artist")) {
      return sortByKey(filteredTracks, (t) => t.user?.name ?? "", dir);
    }
    return sortByKey(filteredTracks, (t) => t.title, dir);
  }, [filteredTracks, searchSort, isSearchMode]);

  const handlePlay = (track: AudiusTrack) => {
    void playTrack({
      id: track.id,
      title: track.title,
      artists: [track.user.name],
      genre: track.genre ?? activePreset,
      duration: formatAudiusDuration(track.duration),
      image: getAudiusArtworkUrl(track.artwork),
      streamUrl: getAudiusStreamUrl(track.id),
      source: "audius",
    });
  };

  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    setSearchText(preset);
    setSearchSort("relevance");
  };

  const clearSearch = () => {
    setSearchText("");
    setActivePreset("");
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
                  placeholder="Search tracks, artists, genres…"
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

          {isSearchMode && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
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
          )}
        </div>

        {!isSearchMode && (
          <>
            <p className="text-xs kawaify-text-muted mb-3">
              Рекомендації для тебе — випадковий підбір популярних треків
            </p>
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
          </>
        )}

        {loadError && (
          <div className="mb-4 home-notice home-notice-error rounded-xl p-4">
            <p className="text-sm">{loadError}</p>
          </div>
        )}

        {isLoading && (
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="kawaify-card aspect-[3/4] animate-pulse bg-[var(--surface-soft)]/50"
              />
            ))}
          </div>
        )}

        {!isLoading && !loadError && displayTracks.length === 0 && (
          <div className="mb-4 home-notice rounded-xl p-5">
            <p className="font-semibold text-[var(--text)]">Нічого не знайдено</p>
            <p className="text-sm mt-1 kawaify-text-muted">
              Спробуй інший запит, фільтр або жанр.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-2">
          {!isLoading &&
            displayTracks.map((track) => (
              <TrackCard
                key={track.id}
                title={track.title}
                artist={track.user.name}
                image={getAudiusArtworkUrl(track.artwork)}
                onPlay={() => handlePlay(track)}
              />
            ))}
        </div>

        {!isSearchMode && !isLoading && displayTracks.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="min-w-[160px]"
            >
              {isLoadingMore ? "Завантаження…" : "Завантажити ще"}
            </Button>
          </div>
        )}

        {isLoadingMore && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="kawaify-card aspect-[3/4] animate-pulse bg-[var(--surface-soft)]/50"
              />
            ))}
          </div>
        )}
      </div>

      <div className="home-shell-overlay absolute inset-0 rounded-lg z-0" />
    </div>
  );
};

export default MainSection;
