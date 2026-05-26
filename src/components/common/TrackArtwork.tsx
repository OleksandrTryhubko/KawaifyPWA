import { useState } from "react";
import clsx from "clsx";

interface TrackArtworkProps {
  src?: string | null;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

function isValidSrc(src?: string | null): boolean {
  if (!src) return false;
  const trimmed = src.trim();
  return trimmed.length > 0 && trimmed !== "/fallback.jpg" && trimmed !== "fallback.jpg";
}

export default function TrackArtwork({
  src,
  alt,
  className,
  size = "md",
}: TrackArtworkProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = !isValidSrc(src) || hasError;

  if (showFallback) {
    return (
      <div
        className={clsx(
          "w-full aspect-square rounded-md overflow-hidden",
          "bg-gradient-to-br from-pink-600/40 via-purple-900/60 to-zinc-900",
          "border border-pink-500/20 flex flex-col items-center justify-center gap-1",
          "shadow-inner",
          className
        )}
        aria-label={alt}
      >
        <span className={clsx("select-none", sizeClasses[size])} aria-hidden>
          ♪
        </span>
        <span className="text-[10px] text-pink-200/70 font-medium px-2 text-center line-clamp-2">
          Kawaify
        </span>
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={alt}
      loading="lazy"
      className={clsx("w-full aspect-square object-cover rounded-md", className)}
      onError={() => setHasError(true)}
    />
  );
}
