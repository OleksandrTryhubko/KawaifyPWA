export interface Playlist {
  id: string;
  title: string;
  image?: string;
  coverUrl?: string;
  coverPath?: string;
  description?: string;
  accentColor?: string;
  createdAt: Date | { seconds: number; nanoseconds: number } | string;
  updatedAt?: Date | { seconds: number; nanoseconds: number } | string;
  trackIds: string[];
  ownerId?: string;
}

export const PLAYLIST_ACCENT_PRESETS = [
  "#ec4899",
  "#a855f7",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
] as const;
