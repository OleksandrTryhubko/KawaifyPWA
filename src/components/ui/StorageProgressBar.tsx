import clsx from "clsx";

interface StorageProgressBarProps {
  usedBytes: number;
  maxBytes: number;
  className?: string;
  showLabels?: boolean;
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StorageProgressBar({
  usedBytes,
  maxBytes,
  className,
  showLabels = true,
}: StorageProgressBarProps) {
  const percent = maxBytes > 0 ? Math.min(100, (usedBytes / maxBytes) * 100) : 0;
  const remaining = Math.max(0, maxBytes - usedBytes);

  return (
    <div className={clsx("space-y-2", className)}>
      <div
        className="h-2.5 w-full rounded-full overflow-hidden bg-[var(--surface-soft)] border border-[var(--border)]"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            percent >= 90
              ? "bg-gradient-to-r from-red-500 to-orange-500"
              : "bg-gradient-to-r from-pink-500 to-purple-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs kawaify-text-muted">
          <span>
            Used: <span className="text-[var(--text)] font-medium">{formatMb(usedBytes)}</span>
            {" / "}
            {formatMb(maxBytes)}
          </span>
          <span>
            Remaining:{" "}
            <span className="text-[var(--text)] font-medium">{formatMb(remaining)}</span>
          </span>
        </div>
      )}
    </div>
  );
}
