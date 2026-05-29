import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getRecentlyPlayed } from "../../services/recentlyPlayedService";
import { buildUserActivity, type UserActivityItem } from "../../services/userActivityService";
import { getUserLocalTracks } from "../../features/local-music/localTracksMetadataService";

const TYPE_LABELS: Record<UserActivityItem["type"], string> = {
  played_track: "Played",
  uploaded_local_track: "Uploaded",
  created_playlist: "Playlist",
  updated_playlist: "Updated",
  added_to_favorites: "Favorites",
};

export default function UserActivityBlock() {
  const { user } = useAuth();
  const [activity, setActivity] = useState<UserActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getRecentlyPlayed(user.uid, 5), getUserLocalTracks(user.uid)])
      .then(([recent, localTracks]) => {
        if (cancelled) return;
        setActivity(
          buildUserActivity({
            recentlyPlayed: recent,
            localTracks,
            playlists: user.playlists ?? [],
            favoritesCount: user.favorites?.length ?? 0,
          })
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="kawaify-card p-5">
      <h2 className="text-lg font-semibold text-[var(--text)]">Recent activity</h2>

      {loading && (
        <p className="text-sm kawaify-text-muted mt-3 animate-pulse">Loading…</p>
      )}

      {!loading && activity.length === 0 && (
        <div className="mt-4 rounded-lg border border-[var(--border)] p-6 text-center text-sm kawaify-text-muted">
          <span className="text-2xl block mb-2" aria-hidden>
            ✨
          </span>
          No activity yet. Play music or upload local tracks.
        </div>
      )}

      {!loading && activity.length > 0 && (
        <ul className="mt-4 space-y-2">
          {activity.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2.5"
            >
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 shrink-0">
                {TYPE_LABELS[item.type]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text)] truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs kawaify-text-muted truncate">{item.subtitle}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
