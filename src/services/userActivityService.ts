import type { Playlist } from "../types/playlist";
import type { LocalTrackMetadataDoc } from "../features/local-music/types";
import type { RecentlyPlayedItem } from "./recentlyPlayedService";

export type UserActivityType =
  | "played_track"
  | "uploaded_local_track"
  | "created_playlist"
  | "updated_playlist"
  | "added_to_favorites";

export interface UserActivityItem {
  id: string;
  type: UserActivityType;
  title: string;
  subtitle?: string;
  timestamp: number;
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return 0;
}

export function buildUserActivity(params: {
  recentlyPlayed: RecentlyPlayedItem[];
  localTracks: LocalTrackMetadataDoc[];
  playlists: Playlist[];
  favoritesCount: number;
}): UserActivityItem[] {
  const items: UserActivityItem[] = [];

  for (const r of params.recentlyPlayed.slice(0, 5)) {
    items.push({
      id: `played-${r.trackId}`,
      type: "played_track",
      title: r.title,
      subtitle: r.artist,
      timestamp: toMillis(r.playedAt) || Date.now(),
    });
  }

  for (const t of params.localTracks.slice(0, 3)) {
    items.push({
      id: `local-${t.id}`,
      type: "uploaded_local_track",
      title: t.title,
      subtitle: t.fileName,
      timestamp: toMillis(t.createdAt) || 0,
    });
  }

  for (const p of params.playlists.slice(0, 3)) {
    items.push({
      id: `playlist-${p.id}`,
      type: "created_playlist",
      title: p.title,
      subtitle: `${p.trackIds?.length ?? 0} tracks`,
      timestamp: toMillis(p.createdAt) || 0,
    });
  }

  if (params.favoritesCount > 0) {
    items.push({
      id: "favorites-summary",
      type: "added_to_favorites",
      title: "Favorites",
      subtitle: `${params.favoritesCount} tracks saved`,
      timestamp: Date.now(),
    });
  }

  return items
    .filter((i) => i.timestamp > 0 || i.type === "added_to_favorites")
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);
}
