import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePlayerStore } from "../../store/playerStore";
import {
  getRecentlyPlayed,
  recentlyPlayedToTrack,
  type RecentlyPlayedItem,
} from "../../services/recentlyPlayedService";
import CompactTrackCard from "./CompactTrackCard";

export default function RecentlyPlayedSection() {
  const { user } = useAuth();
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      return;
    }

    setLoading(true);
    getRecentlyPlayed(user.uid, 15)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (!user) return null;

  return (
    <section className="mb-5">
      <h2 className="text-base sm:text-lg font-bold text-[var(--text)] mb-2">
        Нещодавно прослухане
      </h2>

      {loading && (
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[100px] aspect-square rounded-md bg-[var(--surface-soft)]/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="kawaify-card px-4 py-3 text-center">
          <p className="text-xs font-medium text-[var(--text)]">Ще нічого не слухали</p>
          <p className="text-[10px] kawaify-text-muted mt-0.5">
            Запусти трек — він зʼявиться тут.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div
          ref={scrollRef}
          className="recently-scroll flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth"
          style={{ scrollBehavior: "smooth" }}
        >
          {items.map((item) => (
            <CompactTrackCard
              key={item.trackId}
              title={item.title}
              artist={item.artist}
              image={item.artwork}
              onPlay={() => {
                const track = recentlyPlayedToTrack(item);
                void playTrack(track);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
