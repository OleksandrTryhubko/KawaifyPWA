import { useState } from "react";
import { X, Trash2, GripVertical } from "lucide-react";
import { usePlayerStore } from "../../store/playerStore";
import TrackArtwork from "../common/TrackArtwork";
import clsx from "clsx";

export default function QueuePanel() {
  const {
    queuePanelOpen,
    setQueuePanelOpen,
    queue,
    queueIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    setIsPlaying,
  } = usePlayerStore();

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (!queuePanelOpen) return null;

  const playAt = (index: number) => {
    const track = queue[index];
    if (!track) return;
    void playTrack(track, { queue, index });
    setIsPlaying(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setQueuePanelOpen(false)}
        aria-hidden
      />
      <aside
        className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md kawaify-surface border-l border-[var(--border)] shadow-2xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label="Playback queue"
      >
        <header className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text)]">Черга</h2>
          <div className="flex gap-2">
            {queue.length > 0 && (
              <button
                type="button"
                onClick={clearQueue}
                className="text-xs text-[var(--text-muted)] hover:text-red-400 transition px-2 py-1"
              >
                Очистити
              </button>
            )}
            <button
              type="button"
              onClick={() => setQueuePanelOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 transition"
              aria-label="Close queue"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {queue.length === 0 && (
            <p className="text-sm kawaify-text-muted text-center py-8">Черга порожня</p>
          )}

          {queue.map((track, index) => {
            const isCurrent = currentTrack?.id === track.id && index === queueIndex;
            return (
              <div
                key={`${track.id}-${index}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null && dragIndex !== index) {
                    reorderQueue(dragIndex, index);
                  }
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={clsx(
                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition group",
                  isCurrent
                    ? "bg-pink-500/15 border border-pink-500/30"
                    : "hover:bg-white/5 border border-transparent"
                )}
                onClick={() => playAt(index)}
              >
                <GripVertical className="h-4 w-4 text-[var(--text-muted)] opacity-40 group-hover:opacity-80 shrink-0 cursor-grab" />
                <div className="w-10 h-10 shrink-0 rounded overflow-hidden">
                  <TrackArtwork
                    src={track.image}
                    alt={track.title}
                    className="!aspect-auto w-10 h-10"
                    size="sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[var(--text)]">{track.title}</p>
                  <p className="text-xs truncate kawaify-text-muted">
                    {track.artists?.join(", ")}
                  </p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] text-pink-400 font-semibold shrink-0">▶</span>
                )}
                <button
                  type="button"
                  className="p-1.5 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(index);
                  }}
                  aria-label="Remove from queue"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
