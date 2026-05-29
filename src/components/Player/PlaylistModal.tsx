import { useState, useEffect, useCallback, useRef, type ChangeEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  addTrackToUserPlaylist,
  addUserPlaylist,
} from "../../services/userService";
import { uploadPlaylistCover } from "../../services/playlistCoverService";
import { usePlayerStore } from "../../store/playerStore";
import { useToast } from "../../hooks/useToast";
import {
  isPlaylistTitleTaken,
  isTrackInPlaylist,
} from "../../utils/playlistHelpers";
import type { Playlist } from "../../types/playlist";
import { PLAYLIST_ACCENT_PRESETS } from "../../types/playlist";
import Button from "../ui/Button";

interface PlaylistModalProps {
  open: boolean;
  onClose: () => void;
}

const PlaylistModal = ({ open, onClose }: PlaylistModalProps) => {
  const { user, refreshUser } = useAuth();
  const { currentTrack } = usePlayerStore();
  const toast = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [newTitle, setNewTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accentColor, setAccentColor] = useState<string>(PLAYLIST_ACCENT_PRESETS[0]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setPlaylists(user.playlists || []);
  }, [user]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const resetForm = () => {
    setNewTitle("");
    setDescription("");
    setAccentColor(PLAYLIST_ACCENT_PRESETS[0]);
    setCoverFile(null);
  };

  const handleClose = useCallback(() => {
    if (busy) return;
    resetForm();
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

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Підтримуються PNG, JPG або WEBP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Макс. 2 MB");
      return;
    }
    setCoverFile(file);
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
      const playlistId = Date.now().toString();
      let coverUrl = currentTrack?.image ?? "";
      let coverPath: string | undefined;

      if (coverFile) {
        const uploaded = await uploadPlaylistCover(user.uid, playlistId, coverFile);
        coverUrl = uploaded.coverUrl;
        coverPath = uploaded.coverPath;
      }

      const newPlaylist: Playlist = {
        id: playlistId,
        title: trimmed,
        description: description.trim() || undefined,
        accentColor,
        coverUrl,
        coverPath,
        image: coverUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        trackIds: currentTrack ? [currentTrack.id] : [],
      };

      const result = await addUserPlaylist(user.uid, newPlaylist);

      switch (result) {
        case "created":
          toast.success("Плейлист створено");
          await refreshUser();
          resetForm();
          handleClose();
          break;
        case "duplicate_name":
          toast.warning("Плейлист з такою назвою вже існує");
          break;
        default:
          toast.error("Помилка при збереженні");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Помилка при збереженні");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="relative kawaify-surface border border-[var(--border)] p-5 rounded-t-2xl sm:rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="playlist-modal-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 kawaify-text-muted hover:text-[var(--text)] text-xl leading-none"
          aria-label="Закрити"
        >
          ×
        </button>

        <h2
          id="playlist-modal-title"
          className="text-lg font-semibold text-[var(--text)] mb-4 pr-6"
        >
          Додати в плейлист
        </h2>

        {playlists.length > 0 ? (
          <ul className="space-y-1 max-h-40 overflow-y-auto mb-4">
            {playlists.map((pl) => (
              <li key={pl.id}>
                <button
                  type="button"
                  disabled={busy}
                  className="w-full text-left text-[var(--text)] hover:bg-[var(--surface-soft)] disabled:opacity-50 p-2.5 rounded-lg transition"
                  onClick={() => handleAdd(pl)}
                >
                  {pl.title}
                  {currentTrack && isTrackInPlaylist(pl, currentTrack.id) && (
                    <span className="text-xs text-pink-400/80 ml-2">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm kawaify-text-muted mb-4">Плейлистів ще немає</p>
        )}

        <div className="border-t border-[var(--border)] pt-4 space-y-3">
          <p className="text-sm font-medium text-[var(--text)]">Створити новий</p>
          <input
            type="text"
            placeholder="Назва плейлиста"
            className="kawaify-input w-full h-10 px-3 text-sm"
            value={newTitle}
            disabled={busy}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Опис (необовʼязково)"
            className="kawaify-input w-full min-h-[72px] p-3 text-sm resize-none"
            value={description}
            disabled={busy}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <p className="text-xs kawaify-text-muted mb-2">Accent color</p>
            <div className="flex flex-wrap gap-2">
              {PLAYLIST_ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    accentColor === color ? "border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAccentColor(color)}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleCoverChange}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={busy}
            >
              Upload cover
            </Button>
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-10 w-10 rounded object-cover"
              />
            )}
          </div>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={busy}
            variant="primary"
            fullWidth
          >
            {busy ? "Збереження…" : "Створити і додати"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;
