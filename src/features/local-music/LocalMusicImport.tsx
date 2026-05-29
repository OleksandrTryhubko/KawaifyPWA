import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useToast } from "../../hooks/useToast";
import type { Track } from "../../types/track";
import {
  MAX_LOCAL_TRACKS_TOTAL_BYTES,
  type LocalTrackMetadataDoc,
} from "./types";
import {
  deleteLocalTrack,
  getUserLocalTracks,
  getUserLocalTracksTotalSize,
  uploadLocalTrack,
} from "./localTracksMetadataService";

interface LocalMusicImportProps {
  userId: string;
  onPlayTrack?: (track: Track) => void;
  compact?: boolean;
  showList?: boolean;
  showStorage?: boolean;
  detailedList?: boolean;
  onUploaded?: () => void;
}

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

function toPlayableTrack(item: LocalTrackMetadataDoc): Track {
  return {
    id: item.id,
    title: item.title,
    artists: [item.artist || "Local file"],
    duration: "0:00",
    image: "",
    streamUrl: item.downloadUrl,
    source: "local",
    storagePath: item.storagePath,
    fileName: item.fileName,
    mimeType: item.mimeType,
    size: item.size,
  };
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

  const usedText = useMemo(
    () => `${formatMb(usedBytes)} / ${formatMb(MAX_LOCAL_TRACKS_TOTAL_BYTES)}`,
    [usedBytes]
  );

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

  const handleUpload = async (file: File | null) => {
    if (!file || !userId || uploading) return;
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

  const handleDelete = async (track: LocalTrackMetadataDoc) => {
    setBusyTrackId(track.id);
    try {
      await deleteLocalTrack(userId, track.id, track.storagePath);
      await refresh();
      toast.success("Локальний трек видалено");
    } catch {
      toast.error("Не вдалося видалити локальний трек");
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
        <div>
          {compact && (
            <h2 className="text-lg font-semibold text-[var(--text)]">Local Music</h2>
          )}
          {showStorage && (
            <p className="text-sm kawaify-text-muted mt-1">
              Used storage:{" "}
              <span className="font-medium text-[var(--text)]">{usedText}</span>
            </p>
          )}
        </div>
        {uploadControl}
      </div>

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
        <div className="mt-4">
          {tracks.length === 0 ? (
            <div className="rounded-lg border border-[var(--border)] p-6 text-center text-sm kawaify-text-muted">
              <span className="text-2xl block mb-2" aria-hidden>
                ♪
              </span>
              No local tracks yet. Upload an audio file to get started.
            </div>
          ) : detailedList ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="rounded-lg border border-[var(--border)] p-4 flex flex-col gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)] truncate">
                      {track.title}
                    </p>
                    <p className="text-xs kawaify-text-muted truncate mt-0.5">
                      {track.artist}
                    </p>
                    <dl className="mt-2 grid grid-cols-1 gap-1 text-xs kawaify-text-muted">
                      <div className="flex gap-2 min-w-0">
                        <dt className="shrink-0">File:</dt>
                        <dd className="truncate">{track.fileName}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0">Size:</dt>
                        <dd>{formatMb(track.size)}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="shrink-0">Added:</dt>
                        <dd>{formatCreatedAt(track.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex items-center gap-2">
                    {onPlayTrack && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => onPlayTrack(toPlayableTrack(track))}
                      >
                        Play
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={busyTrackId === track.id}
                      onClick={() => handleDelete(track)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => (
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
                        onClick={() => onPlayTrack(toPlayableTrack(track))}
                      >
                        Play
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={busyTrackId === track.id}
                      onClick={() => handleDelete(track)}
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
    </div>
  );
}
