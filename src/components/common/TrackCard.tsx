import clsx from "clsx";
import { Trash2 } from "lucide-react";
import TrackArtwork from "./TrackArtwork";
import Button from "../ui/Button";

interface TrackCardProps {
  title: string;
  artist?: string;
  image?: string;
  onPlay?: () => void;
  onRemove?: () => void;
  showPlayButton?: boolean;
  className?: string;
}

export default function TrackCard({
  title,
  artist,
  image,
  onPlay,
  onRemove,
  showPlayButton = false,
  className,
}: TrackCardProps) {
  return (
    <article
      className={clsx(
        "kawaify-card group flex flex-col h-full p-3 transition",
        "hover:border-pink-500/30 hover:shadow-md",
        onPlay && "cursor-pointer",
        className
      )}
      onClick={onPlay}
      role={onPlay ? "button" : undefined}
      tabIndex={onPlay ? 0 : undefined}
      onKeyDown={
        onPlay
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlay();
              }
            }
          : undefined
      }
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg shrink-0 relative">
        <TrackArtwork
          src={image}
          alt={title}
          className="!aspect-square h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {onPlay && !showPlayButton && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
            aria-hidden
          >
            <span className="w-10 h-10 rounded-full bg-pink-500/90 flex items-center justify-center text-white text-sm shadow-lg">
              ▶
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col min-h-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[var(--text)] line-clamp-2 leading-snug">
              {title}
            </h3>
            {artist && (
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{artist}</p>
            )}
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="shrink-0 h-8 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              aria-label="Remove track"
            />
          )}
        </div>

        {onPlay && showPlayButton && (
          <div className="mt-auto pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-pink-400 hover:text-pink-300 px-0"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            >
              ▶ Play
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
