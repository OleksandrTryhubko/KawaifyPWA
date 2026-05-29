import clsx from "clsx";
import TrackArtwork from "../common/TrackArtwork";

interface CompactTrackCardProps {
  title: string;
  artist?: string;
  image?: string;
  onPlay?: () => void;
  className?: string;
}

/** Compact horizontal card for Recently Played (Spotify-style) */
export default function CompactTrackCard({
  title,
  artist,
  image,
  onPlay,
  className,
}: CompactTrackCardProps) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={clsx(
        "flex flex-col shrink-0 w-[100px] sm:w-[110px] text-left",
        "group transition-transform hover:scale-[1.03] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 rounded-lg",
        className
      )}
    >
      <div className="aspect-square w-full overflow-hidden rounded-md shadow-md ring-1 ring-white/5 group-hover:ring-pink-500/30 transition-all">
        <TrackArtwork
          src={image}
          alt={title}
          className="!aspect-square w-full h-full animate-artwork-in"
        />
      </div>
      <h3 className="mt-1.5 text-xs font-semibold text-[var(--text)] line-clamp-1 leading-tight">
        {title}
      </h3>
      {artist && (
        <p className="text-[10px] kawaify-text-muted truncate mt-0.5">{artist}</p>
      )}
    </button>
  );
}
