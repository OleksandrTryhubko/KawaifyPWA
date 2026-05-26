/** Firestore path helpers for future nested collections */

export const firestorePaths = {
  user: (userId: string) => `users/${userId}`,
  userPlaylists: (userId: string) => `users/${userId}/playlists`,
  userPlaylist: (userId: string, playlistId: string) =>
    `users/${userId}/playlists/${playlistId}`,
  userLocalTracks: (userId: string) => `users/${userId}/localTracks`,
  userLocalTrack: (userId: string, trackId: string) =>
    `users/${userId}/localTracks/${trackId}`,
  /** Legacy global songs cache (Audius metadata) */
  song: (trackId: string) => `songs/${trackId}`,
  /** Legacy top-level playlists collection */
  playlist: (playlistId: string) => `playlists/${playlistId}`,
} as const;
