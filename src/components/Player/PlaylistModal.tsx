import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  addTrackToUserPlaylist,
  addUserPlaylist,
} from "../../services/userService";
import { usePlayerStore } from "../../store/playerStore";
import { useToast } from "../../hooks/useToast";
import {
  isPlaylistTitleTaken,
  isTrackInPlaylist,
} from "../../utils/playlistHelpers";
import type { Playlist } from "../../types/playlist";

interface PlaylistModalProps {
  open: boolean;
  onClose: () => void;
}

const PlaylistModal = ({ open, onClose }: PlaylistModalProps) => {
  const { user, refreshUser } = useAuth();
  const { currentTrack } = usePlayerStore();
  const toast = useToast();
  const [newTitle, setNewTitle] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setPlaylists(user.playlists || []);
  }, [user]);

  const handleClose = useCallback(() => {
    if (busy) return;
    setNewTitle("");
    onClose();
  }, [busy, onClose]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  const handleAdd = async (playlist: Playlist) => {
    if (!user || !currentTrack || busy) return;

    if (isTrackInPlaylist(playlist, currentTrack.id)) {
      toast.warning("Цей трек уже є в плейлисті");
      return;
    }

    setBusy(true);
    try {
      const result = await addTrackToUserPlaylist(
        user.uid,
        playlist.id,
        currentTrack.id
      );

      switch (result) {
        case "added":
          toast.success(`Трек додано в «${playlist.title}»`);
          await refreshUser();
          handleClose();
          break;
        case "already_in_playlist":
          toast.warning("Цей трек уже є в плейлисті");
          break;
        default:
          toast.error("Помилка при збереженні");
      }
    } catch {
      toast.error("Помилка при збереженні");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!user || busy) return;

    const trimmed = newTitle.trim();
    if (trimmed.length === 0) {
      toast.warning("Введи назву плейлиста");
      return;
    }

    if (isPlaylistTitleTaken(playlists, trimmed)) {
      toast.warning("Плейлист з такою назвою вже існує");
      return;
    }

    setBusy(true);
    try {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        title: trimmed,
        createdAt: new Date(),
        image: currentTrack?.image ?? "",
        trackIds: currentTrack ? [currentTrack.id] : [],
      };

      const result = await addUserPlaylist(user.uid, newPlaylist);

      switch (result) {
        case "created":
          toast.success("Плейлист створено");
          await refreshUser();
          setNewTitle("");
          handleClose();
          break;
        case "duplicate_name":
          toast.warning("Плейлист з такою назвою вже існує");
          break;
        default:
          toast.error("Помилка при збереженні");
      }
    } catch {
      toast.error("Помилка при збереженні");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="relative bg-zinc-900 border border-pink-500/20 p-5 rounded-xl w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="playlist-modal-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white text-xl leading-none"
          aria-label="Закрити"
        >
          ×
        </button>

        <h2
          id="playlist-modal-title"
          className="text-white text-lg font-semibold mb-4 pr-6"
        >
          Додати в плейлист
        </h2>

        {playlists.length > 0 ? (
          <ul className="space-y-1 max-h-48 overflow-y-auto mb-4">
            {playlists.map((pl) => (
              <li key={pl.id}>
                <button
                  type="button"
                  disabled={busy}
                  className="w-full text-left text-white hover:bg-zinc-800 disabled:opacity-50 p-2.5 rounded-lg transition"
                  onClick={() => handleAdd(pl)}
                >
                  {pl.title}
                  {currentTrack &&
                    isTrackInPlaylist(pl, currentTrack.id) && (
                      <span className="text-xs text-pink-400/80 ml-2">
                        ✓
                      </span>
                    )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500 text-sm mb-4">Плейлистів ще немає</p>
        )}

        <div className="border-t border-zinc-800 pt-4">
          <input
            type="text"
            placeholder="Нова назва плейлиста"
            className="w-full p-2.5 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-pink-500/40 focus:outline-none mb-2"
            value={newTitle}
            disabled={busy}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white rounded-lg p-2.5 font-medium transition"
          >
            {busy ? "Збереження…" : "Створити і додати"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
