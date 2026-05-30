import { useRef, type ChangeEvent } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import TrackArtwork from "../../components/common/TrackArtwork";
import Button from "../../components/ui/Button";
import type { LocalTrackMetadataDoc } from "./types";
import type { Track } from "../../types/track";

interface LocalTrackCardProps {
  track: LocalTrackMetadataDoc;
  busy?: boolean;
  onPlay?: (track: Track) => void;
  onDelete: () => void;
  onCoverUpload: (file: File) => void;
  formatMb: (bytes: number) => string;
  formatDate: (value: unknown) => string;
}

export function toPlayableLocalTrack(item: LocalTrackMetadataDoc): Track {
  const url = item.downloadUrl?.trim() || "";
  return {
    id: item.id,
    title: item.title,
    artists: [item.artist || "Local file"],
    duration: item.duration || "0:00",
    image: item.coverUrl || "",
    streamUrl: url,
    downloadUrl: url,
    source: "local",
    storagePath: item.storagePath,
    fileName: item.fileName,
    mimeType: item.mimeType,
    size: item.size,
  };
}

export default function LocalTrackCard({
  track,
  busy,
  onPlay,
  onDelete,
  onCoverUpload,
  formatMb,
  formatDate,
}: LocalTrackCardProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onCoverUpload(file);
  };

  return (
    <article className="kawaify-card p-4 flex flex-col sm:flex-row gap-4">
      <div className="relative w-full sm:w-28 shrink-0">
        <div className="aspect-square rounded-lg overflow-hidden">
          <TrackArtwork
            src={track.coverUrl}
            alt={track.title}
            className="!aspect-square w-full h-full"
          />
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleCoverChange}
          aria-hidden
          tabIndex={-1}
        />
        <button
          type="button"
          className="absolute bottom-1 right-1 p-1.5 rounded-full bg-black/50 text-white hover:bg-pink-600/80 transition"
          onClick={() => coverInputRef.current?.click()}
          aria-label="Upload cover"
          disabled={busy}
        >
          <ImagePlus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] truncate">{track.title}</h3>
          <p className="text-xs kawaify-text-muted truncate">{track.artist}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs kawaify-text-muted">
          <div className="col-span-2 flex gap-1 min-w-0">
            <dt className="shrink-0">File:</dt>
            <dd className="truncate">{track.fileName}</dd>
          </div>
          <div>
            <dt>Size:</dt>
            <dd>{formatMb(track.size)}</dd>
          </div>
          <div>
            <dt>Added:</dt>
            <dd>{formatDate(track.createdAt)}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {onPlay && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={() => onPlay(toPlayableLocalTrack(track))}
            >
              Play
            </Button>
          )}
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={busy}
            onClick={onDelete}
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
