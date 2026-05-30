import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import StorageProgressBar from "../../components/ui/StorageProgressBar";
import { useToast } from "../../hooks/useToast";
import type { Track } from "../../types/track";
import { sortByKey, sortByNumber, type SortDirection } from "../../utils/sortHelpers";
import {
  MAX_LOCAL_TRACKS_TOTAL_BYTES,
  type LocalTrackMetadataDoc,
} from "./types";
import {
  deleteLocalTrack,
  getUserLocalTracks,
  getUserLocalTracksTotalSize,
  uploadLocalTrack,
  uploadLocalTrackCover,
  updateLocalTrackMetadata,
} from "./localTracksMetadataService";
import LocalTrackCard, { toPlayableLocalTrack } from "./LocalTrackCard";
import { usePlayerStore } from "../../store/playerStore";

interface LocalMusicImportProps {
  userId: string;
  onPlayTrack?: (track: Track) => void;
  compact?: boolean;
  showList?: boolean;
  showStorage?: boolean;
  detailedList?: boolean;
  onUploaded?: () => void;
}

type SortField = "title" | "date" | "size";

const ALLOWED_ACCEPT =
  "audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4";

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCreatedAt(value: unknown): string {
  if (!value) return "—";
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }
  return "—";
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

export default function LocalMusicImport({
  userId,
  onPlayTrack,
  compact = false,
  showList = true,
  showStorage = true,
  detailedList = false,
  onUploaded,
}: LocalMusicImportProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<LocalTrackMetadataDoc[]>([]);
  const [usedBytes, setUsedBytes] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [busyTrackId, setBusyTrackId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [deleteTarget, setDeleteTarget] = useState<LocalTrackMetadataDoc | null>(null);

  const sortedTracks = useMemo(() => {
    if (sortField === "title") {
      return sortByKey(tracks, (t) => t.title, sortDir);
    }
    if (sortField === "size") {
      return sortByNumber(tracks, (t) => t.size, sortDir);
    }
    return sortByNumber(tracks, (t) => toMillis(t.createdAt), sortDir);
  }, [tracks, sortField, sortDir]);

  const refresh = async () => {
    const [list, total] = await Promise.all([
      getUserLocalTracks(userId),
      getUserLocalTracksTotalSize(userId),
    ]);
    setTracks(list);
    setUsedBytes(total);
  };

  useEffect(() => {
    if (!userId) return;
    refresh().catch(() => {
      toast.error("Не вдалося завантажити локальні треки");
    });
  }, [userId]);

  const openFilePicker = () => {
    if (!userId) {
      toast.error("Потрібен вхід у акаунт");
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    if (!userId) {
      toast.error("Потрібен вхід у акаунт");
      return;
    }
    void handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!userId || uploading) return;
    setUploading(true);
    try {
      await uploadLocalTrack(userId, file);
      await refresh();
      onUploaded?.();
      toast.success("Локальний трек завантажено");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Помилка завантаження локального треку";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyTrackId(deleteTarget.id);
    try {
      await deleteLocalTrack(
        userId,
        deleteTarget.id,
        deleteTarget.storagePath,
        deleteTarget.coverPath
      );
      await refresh();
      toast.success("Локальний трек видалено");
    } catch {
      toast.error("Не вдалося видалити локальний трек");
    } finally {
      setBusyTrackId(null);
      setDeleteTarget(null);
    }
  };

  const handleCoverUpload = async (track: LocalTrackMetadataDoc, file: File) => {
    setBusyTrackId(track.id);
    try {
      await uploadLocalTrackCover(userId, track.id, file, track.coverPath);
      await refresh();
      toast.success("Обкладинку оновлено");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Помилка обкладинки");
    } finally {
      setBusyTrackId(null);
    }
  };

  const handleRename = async (track: LocalTrackMetadataDoc) => {
    const nextTitle = window.prompt("Track title", track.title)?.trim();
    if (!nextTitle || nextTitle === track.title) return;

    const nextArtist = window.prompt("Artist", track.artist)?.trim();
    if (!nextArtist) {
      toast.error("Artist name is required");
      return;
    }

    setBusyTrackId(track.id);
    try {
      await updateLocalTrackMetadata(userId, track.id, {
        title: nextTitle,
        artist: nextArtist,
      });
      await refresh();

      const { currentTrack } = usePlayerStore.getState();
      if (currentTrack?.id === track.id && currentTrack.source === "local") {
        usePlayerStore.setState({
          currentTrack: toPlayableLocalTrack({
            ...track,
            title: nextTitle,
            artist: nextArtist,
          }),
        });
      }

      toast.success("Track renamed");
    } catch {
      toast.error("Failed to rename track");
    } finally {
      setBusyTrackId(null);
    }
  };

  const uploadControl = (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_ACCEPT}
        className="hidden"
        disabled={uploading}
        onChange={handleFileChange}
        aria-hidden
        tabIndex={-1}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={uploading}
        onClick={openFilePicker}
      >
        {uploading ? "Uploading…" : compact ? "Upload audio file" : "Add audio file"}
      </Button>
    </>
  );

  return (
    <div className="kawaify-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {compact && (
            <h2 className="text-lg font-semibold text-[var(--text)]">Local Music</h2>
          )}
          {showStorage && (
            <p className="text-sm kawaify-text-muted mt-1">
              <span className="font-medium text-[var(--text)]">{tracks.length}</span> local
              track{tracks.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
        {uploadControl}
      </div>

      {showStorage && (
        <div className="mt-4">
          <StorageProgressBar usedBytes={usedBytes} maxBytes={MAX_LOCAL_TRACKS_TOTAL_BYTES} />
        </div>
      )}

      <p className="text-xs kawaify-text-muted mt-2">
        Supported: mp3, wav, ogg, flac, mp4. Max file 25 MB, total 200 MB.
      </p>

      {compact && (
        <div className="mt-4">
          <Link to="/my-music">
            <Button type="button" variant="ghost" size="sm">
              Open My Music
            </Button>
          </Link>
        </div>
      )}

      {showList && !compact && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <label className="text-xs kawaify-text-muted flex items-center gap-1">
              Sort
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="kawaify-input h-8 px-2 text-xs"
              >
                <option value="title">Name</option>
                <option value="date">Date</option>
                <option value="size">Size</option>
              </select>
            </label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as SortDirection)}
              className="kawaify-input h-8 px-2 text-xs"
              aria-label="Sort direction"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {sortedTracks.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] p-8 text-center text-sm kawaify-text-muted">
              <span className="text-3xl block mb-2" aria-hidden>
                ♪
              </span>
              No local tracks yet. Upload an audio file to get started.
            </div>
          ) : detailedList ? (
            <div className="grid grid-cols-1 gap-4">
              {sortedTracks.map((track) => (
                <LocalTrackCard
                  key={track.id}
                  track={track}
                  busy={busyTrackId === track.id}
                  onPlay={onPlayTrack}
                  onDelete={() => setDeleteTarget(track)}
                  onRename={() => void handleRename(track)}
                  onCoverUpload={(file) => void handleCoverUpload(track, file)}
                  formatMb={formatMb}
                  formatDate={formatCreatedAt}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTracks.map((track) => (
                <div
                  key={track.id}
                  className="rounded-lg border border-[var(--border)] p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">
                      {track.title}
                    </p>
                    <p className="text-xs kawaify-text-muted truncate">
                      {track.artist} · {formatMb(track.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onPlayTrack && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlayTrack(toPlayableLocalTrack(track))}
                      >
                        Play
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={busyTrackId === track.id}
                      onClick={() => setDeleteTarget(track)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete local track?"
        message={`Remove "${deleteTarget?.title}" from your library? This cannot be undone.`}
        confirmLabel="Delete"
        busy={Boolean(busyTrackId)}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
