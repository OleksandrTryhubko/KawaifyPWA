import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usePlayerStore } from "../../store/playerStore";
import {
  getRecentlyPlayed,
  recentlyPlayedToTrack,
  type RecentlyPlayedItem,
} from "../../services/recentlyPlayedService";
import TrackCard from "../common/TrackCard";

export default function RecentlyPlayedSection() {
  const { user } = useAuth();
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      return;
    }

    setLoading(true);
    getRecentlyPlayed(user.uid, 10)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (!user) return null;

  return (
    <section className="mb-8">
      <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-3">
        Нещодавно прослухане
      </h2>

      {loading && (
        <p className="text-sm kawaify-text-muted animate-pulse">Loading history…</p>
      )}

      {!loading && items.length === 0 && (
        <div className="kawaify-card p-6 text-center">
          <span className="text-3xl block mb-2" aria-hidden>
            ♪
          </span>
          <p className="text-sm font-medium text-[var(--text)]">Ще нічого не слухали</p>
          <p className="text-xs kawaify-text-muted mt-1">
            Запусти трек з пошуку або My Music — він зʼявиться тут.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => (
            <TrackCard
              key={item.trackId}
              title={item.title}
              artist={item.artist}
              image={item.artwork}
              showPlayButton
              onPlay={() => {
                const track = recentlyPlayedToTrack(item);
                setCurrentTrack(track);
                setIsPlaying(true);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
