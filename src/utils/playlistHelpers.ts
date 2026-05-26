import type { Playlist } from "../types/playlist";

export function normalizePlaylistTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function isPlaylistTitleTaken(
  playlists: Playlist[],
  title: string,
  excludeId?: string
): boolean {
  const normalized = normalizePlaylistTitle(title);
  if (!normalized) return false;

  return playlists.some(
    (pl) =>
      pl.id !== excludeId &&
      normalizePlaylistTitle(pl.title) === normalized
  );
}

export function isTrackInPlaylist(playlist: Playlist, trackId: string): boolean {
  return playlist.trackIds.includes(trackId);
}
