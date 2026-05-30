import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { playTracksFromList } from "../store/playerStore";
import { toggleFavoriteTrack } from "../services/userService";
import { useToast } from "../hooks/useToast";
import { useLanguage } from "../hooks/useLanguage";
import type { Track } from "../types/track";
import { resolveTracksByIds } from "../utils/resolveTrackById";
import TrackCard from "../components/common/TrackCard";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { sortByKey, type SortDirection } from "../utils/sortHelpers";

type FavSort = "name-asc" | "name-desc" | "artist-asc" | "artist-desc";

const FavoritesPage = () => {
  const { user, refreshUser } = useAuth();
  const [songs, setSongs] = useState<Track[]>([]);
  const [sort, setSort] = useState<FavSort>("name-asc");
  const [removeTarget, setRemoveTarget] = useState<Track | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      setSongs([]);
      return;
    }
    const fetchSongs = async () => {
      const loaded = await resolveTracksByIds(user.uid, user.favorites);
      setSongs(loaded);
    };

    void fetchSongs();
  }, [user?.uid, user?.favorites]);

  const sortedSongs = useMemo(() => {
    const dir: SortDirection = sort.endsWith("desc") ? "desc" : "asc";
    if (sort.startsWith("artist")) {
      return sortByKey(songs, (s) => s.artists?.join(", ") || "", dir);
    }
    return sortByKey(songs, (s) => s.title, dir);
  }, [songs, sort]);

  const handlePlay = (song: Track) => {
    playTracksFromList(sortedSongs, song);
  };

  const confirmRemove = async () => {
    if (!user || !removeTarget) return;
    setBusy(true);
    try {
      await toggleFavoriteTrack(user.uid, removeTarget.id);
      setSongs((prev) => prev.filter((s) => s.id !== removeTarget.id));
      await refreshUser();
      toast.success("Видалено з обраного");
    } catch {
      toast.error("Не вдалося видалити");
    } finally {
      setBusy(false);
      setRemoveTarget(null);
    }
  };

  return (
    <div className="kawaify-page kawaify-text overflow-x-hidden max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            ♥ {t("favorites.title")}
          </h1>
          <p className="text-sm kawaify-text-muted mt-1">
            {t("favorites.count", { count: user?.favorites?.length ?? songs.length })}
          </p>
        </div>
        {songs.length > 0 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as FavSort)}
            className="kawaify-input h-10 px-3 text-sm w-full sm:w-auto"
            aria-label="Sort favorites"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="artist-asc">Artist A-Z</option>
            <option value="artist-desc">Artist Z-A</option>
          </select>
        )}
      </header>

      {songs.length === 0 ? (
        <div className="kawaify-card p-8 text-center">
          <span className="text-4xl block mb-3" aria-hidden>
            ♥
          </span>
          <p className="font-medium text-[var(--text)]">У обраному поки немає треків</p>
          <p className="text-sm kawaify-text-muted mt-2">
            Натисни ♥ на треку в плеєрі, щоб додати сюди.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSongs.map((song) => (
            <div key={song.id} className="relative group">
              <TrackCard
                title={song.title}
                artist={song.artists?.join(", ")}
                image={song.image}
                onPlay={() => handlePlay(song)}
              />
              <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setRemoveTarget(song)}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  aria-label="Remove from favorites"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove from favorites?"
        message={`Remove "${removeTarget?.title}" from your favorites?`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
};

export default FavoritesPage;
