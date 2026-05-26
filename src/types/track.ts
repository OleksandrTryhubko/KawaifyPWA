export type TrackSource = "audius" | "local";

export interface Track {
  id: string;
  title: string;
  artists: string[];
  genre?: string;
  duration: string;
  image: string;
  streamUrl: string;
  source: TrackSource | string;
  storagePath?: string;
  objectUrl?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface LocalTrackMetadata extends Track {
  source: "local";
  storagePath?: string;
  objectUrl?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  userId?: string;
  uploadedAt?: string;
}
