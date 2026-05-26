export interface Playlist {
  id: string;
  title: string;
  image?: string;
  createdAt: Date | { seconds: number; nanoseconds: number } | string;
  trackIds: string[];
  ownerId?: string;
}
