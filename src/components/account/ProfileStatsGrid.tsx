import { formatListeningTime } from "../../utils/listeningTime";
import type { UserProfile } from "../../types/user";

interface ProfileStatsGridProps {
  user: UserProfile;
  localTracksCount: number;
}

export default function ProfileStatsGrid({ user, localTracksCount }: ProfileStatsGridProps) {
  const playlistsCount = user.playlists?.length ?? 0;
  const favoritesCount = user.favorites?.length ?? 0;
  const tracksPlayed = user.stats?.tracksPlayed ?? 0;
  const listeningSeconds = user.stats?.listeningSeconds ?? 0;

  const stats = [
    { label: "Tracks played", value: tracksPlayed },
    { label: "Playlists", value: playlistsCount },
    { label: "Favorites", value: favoritesCount },
    { label: "Local tracks", value: localTracksCount },
    {
      label: "Listening time",
      value: formatListeningTime(listeningSeconds),
      highlight: true,
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="kawaify-surface rounded-lg border border-[var(--border)] p-4"
        >
          <div className="text-xs kawaify-text-muted">{stat.label}</div>
          <div
            className={`text-xl font-bold mt-1 truncate ${
              stat.highlight ? "text-pink-400" : ""
            }`}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
