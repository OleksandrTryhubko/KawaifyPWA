export interface AudiusArtwork {
  "150x150"?: string;
  "480x480"?: string;
  "1000x1000"?: string;
  "320"?: string;
}

export interface AudiusUser {
  name: string;
  id?: string;
  handle?: string;
}

export interface AudiusTrack {
  id: string;
  title: string;
  duration: number;
  stream_url?: string;
  genre?: string;
  artwork?: AudiusArtwork;
  user: AudiusUser;
}

export interface AudiusSearchResponse {
  data?: AudiusTrack[];
}
