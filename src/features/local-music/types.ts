import type { LocalTrackMetadata } from "../../types/track";

export type { LocalTrackMetadata };

export const SUPPORTED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
] as const;

export const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg", ".flac"] as const;
export const MAX_LOCAL_TRACK_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_LOCAL_TRACKS_TOTAL_BYTES = 200 * 1024 * 1024;

export interface LocalFileValidationResult {
  valid: boolean;
  error?: string;
}

export interface BasicAudioMetadata {
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  durationSeconds?: number;
}

/** Firestore model (metadata only) prepared for local tracks */
export interface LocalTrackMetadataDoc {
  id: string;
  userId: string;
  title: string;
  artist: string;
  source: "local";
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  downloadUrl: string;
  coverUrl?: string;
  coverPath?: string;
  duration?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export const MAX_LOCAL_COVER_SIZE_BYTES = 2 * 1024 * 1024;
export const SUPPORTED_COVER_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
