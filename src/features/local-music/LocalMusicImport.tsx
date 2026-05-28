import { useEffect, useMemo, useState } from "react";
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
}

const ALLOWED_ACCEPT =
  "audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4";

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
}: LocalMusicImportProps) {
  const toast = useToast();
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

  const handleUpload = async (file: File | null) => {
    if (!file || !userId || uploading) return;
    setUploading(true);
    try {
      await uploadLocalTrack(userId, file);
      await refresh();
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
      toast.info("Локальний трек видалено");
    } catch {
      toast.error("Не вдалося видалити локальний трек");
    } finally {
      setBusyTrackId(null);
    }
  };

  return (
    <div className="kawaify-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text)]">Local Music</h2>
          <p className="text-sm kawaify-text-muted mt-1">
            Used storage: <span className="font-medium text-[var(--text)]">{usedText}</span>
          </p>
        </div>
        <label className="inline-flex items-center">
          <input
            type="file"
            accept={ALLOWED_ACCEPT}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleUpload(e.target.files?.[0] ?? null);
              e.currentTarget.value = "";
            }}
          />
          <span className="cursor-pointer">
            <Button type="button" variant="secondary" size="sm" disabled={uploading}>
              {uploading ? "Uploading…" : "Add audio file"}
            </Button>
          </span>
        </label>
      </div>

      <p className="text-xs kawaify-text-muted mt-2">
        Supported: mp3, wav, ogg, flac, mp4. Max file 25 MB, total 200 MB.
      </p>

      <div className="mt-4 space-y-2">
        {tracks.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] p-3 text-sm kawaify-text-muted">
            Немає локальних треків
          </div>
        ) : (
          tracks.map((track) => (
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
          ))
        )}
      </div>
    </div>
  );
}
