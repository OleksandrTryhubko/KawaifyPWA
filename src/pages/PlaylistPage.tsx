import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shuffle, Play, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { playTracksFromList, usePlayerStore } from "../store/playerStore";
import { useToast } from "../hooks/useToast";
import { updateUserPlaylists } from "../services/userService";
import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";
import { resolveTracksByIds } from "../utils/resolveTrackById";
import TrackArtwork from "../components/common/TrackArtwork";
import TrackCard from "../components/common/TrackCard";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { formatTotalDuration, parseDurationToSeconds } from "../utils/duration";
import { sortByKey, type SortDirection } from "../utils/sortHelpers";

const PlaylistPage = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Track[]>([]);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [confirmDeletePlaylist, setConfirmDeletePlaylist] = useState(false);
  const [removeTrackTarget, setRemoveTrackTarget] = useState<Track | null>(null);
  const [busy, setBusy] = useState(false);
  const shuffleEnabled = usePlayerStore((s) => s.shuffleEnabled);

  useEffect(() => {
    if (!user || !id) return;

    const foundPlaylist = user.playlists.find((p) => p.id === id);
    setPlaylist(foundPlaylist ?? null);

    const fetchTracks = async () => {
      if (!foundPlaylist?.trackIds?.length) {
        setSongs([]);
        return;
      }

      const loadedSongs = await resolveTracksByIds(user.uid, foundPlaylist.trackIds);
      setSongs(loadedSongs);
    };

    fetchTracks();
  }, [user, id]);

  const sortedSongs = useMemo(
    () => sortByKey(songs, (s) => s.title, sortDir),
    [songs, sortDir]
  );

  const totalDuration = useMemo(
    () => songs.reduce((sum, s) => sum + parseDurationToSeconds(s.duration), 0),
    [songs]
  );

  const coverSrc = playlist?.coverUrl || playlist?.image;

  const playTrack = (song: Track) => {
    playTracksFromList(sortedSongs, song, shuffleEnabled);
  };

  const playAll = (shuffle = false) => {
    if (sortedSongs.length === 0) return;
    const first = sortedSongs[0];
    playTracksFromList(sortedSongs, first, shuffle);
    toast.info(shuffle ? "Shuffle play started ♪" : "Play All started ♪");
  };

  const persistPlaylists = async (playlists: Playlist[]) => {
    if (!user) return;
    await updateUserPlaylists(user.uid, playlists);
    await refreshUser();
  };

  const handleRemoveTrack = async () => {
    if (!user || !playlist || !removeTrackTarget) return;
    setBusy(true);
    try {
      const updatedPlaylists = user.playlists.map((p) =>
        p.id === playlist.id
          ? { ...p, trackIds: p.trackIds.filter((tid) => tid !== removeTrackTarget.id) }
          : p
      );
      await persistPlaylists(updatedPlaylists);
      setPlaylist((prev) =>
        prev
          ? { ...prev, trackIds: prev.trackIds.filter((tid) => tid !== removeTrackTarget.id) }
          : null
      );
      setSongs((prev) => prev.filter((s) => s.id !== removeTrackTarget.id));
      toast.success("Трек видалено з плейлиста");
    } catch {
      toast.error("Помилка видалення");
    } finally {
      setBusy(false);
      setRemoveTrackTarget(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!user || !playlist) return;
    setBusy(true);
    try {
      const updatedPlaylists = user.playlists.filter((p) => p.id !== playlist.id);
      await persistPlaylists(updatedPlaylists);
      toast.success("Плейлист видалено");
      navigate("/");
    } catch {
      toast.error("Помилка видалення плейлиста");
    } finally {
      setBusy(false);
      setConfirmDeletePlaylist(false);
    }
  };

  const handleRename = async () => {
    if (!user || !playlist) return;
    const next = window.prompt("Нова назва плейлиста", playlist.title)?.trim();
    if (!next || next === playlist.title) return;

    const updatedPlaylists = user.playlists.map((p) =>
      p.id === playlist.id ? { ...p, title: next, updatedAt: new Date() } : p
    );
    try {
      await persistPlaylists(updatedPlaylists);
      setPlaylist((prev) => (prev ? { ...prev, title: next } : null));
      toast.success("Плейлист перейменовано");
    } catch {
      toast.error("Помилка збереження");
    }
  };

  if (!playlist) {
    return (
      <div className="kawaify-page kawaify-text">
        <div className="kawaify-card p-8 text-center kawaify-text-muted">
          Playlist not found or not owned by you
        </div>
      </div>
    );
  }

  return (
    <div className="kawaify-page kawaify-text overflow-x-hidden max-w-5xl mx-auto">
      <header
        className="kawaify-card p-5 sm:p-6 mb-6 flex flex-col sm:flex-row gap-5"
        style={
          playlist.accentColor
            ? { borderColor: `${playlist.accentColor}44` }
            : undefined
        }
      >
        <div className="w-32 h-32 sm:w-36 sm:h-36 shrink-0 overflow-hidden rounded-xl shadow-md mx-auto sm:mx-0">
          <TrackArtwork
            src={coverSrc}
            alt={playlist.title}
            className="!aspect-square w-full h-full"
          />
        </div>
        <div className="flex flex-col gap-2 min-w-0 flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{playlist.title}</h1>
          {playlist.description && (
            <p className="text-sm kawaify-text-muted line-clamp-2">{playlist.description}</p>
          )}
          <p className="text-sm kawaify-text-muted">
            {songs.length} tracks · {formatTotalDuration(totalDuration)}
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={() => playAll(false)}
              disabled={songs.length === 0}
            >
              Play All
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Shuffle className="h-4 w-4" />}
              onClick={() => playAll(true)}
              disabled={songs.length === 0}
            >
              Shuffle
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleRename}>
              Rename
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => setConfirmDeletePlaylist(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </header>

      {songs.length > 0 && (
        <div className="mb-4 flex justify-end">
          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as SortDirection)}
            className="kawaify-input h-9 px-2 text-sm"
            aria-label="Sort tracks"
          >
            <option value="asc">Name A-Z</option>
            <option value="desc">Name Z-A</option>
          </select>
        </div>
      )}

      {songs.length === 0 ? (
        <div className="kawaify-card p-8 text-center kawaify-text-muted">
          <span className="text-3xl block mb-2" aria-hidden>
            ♪
          </span>
          <p className="font-medium text-[var(--text)]">У цьому плейлисті поки немає треків</p>
          <p className="text-sm mt-2">Додай треки з плеєра через «Add to playlist».</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSongs.map((song) => (
            <TrackCard
              key={song.id}
              title={song.title}
              artist={song.artists?.join(", ")}
              image={song.image}
              onPlay={() => playTrack(song)}
              onRemove={() => setRemoveTrackTarget(song)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeletePlaylist}
        title="Delete playlist?"
        message={`Delete "${playlist.title}" permanently?`}
        busy={busy}
        onConfirm={() => void handleDeletePlaylist()}
        onCancel={() => setConfirmDeletePlaylist(false)}
      />

      <ConfirmDialog
        open={Boolean(removeTrackTarget)}
        title="Remove from playlist?"
        message={`Remove "${removeTrackTarget?.title}" from this playlist?`}
        confirmLabel="Remove"
        busy={busy}
        onConfirm={() => void handleRemoveTrack()}
        onCancel={() => setRemoveTrackTarget(null)}
      />
    </div>
  );
};

export default PlaylistPage;
