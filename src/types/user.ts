import type { Playlist } from "./playlist";

export interface UserStats {
  listeningSeconds: number;
  tracksPlayed: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatar: string;
  favorites: string[];
  playlists: Playlist[];
  stats: UserStats;
}
