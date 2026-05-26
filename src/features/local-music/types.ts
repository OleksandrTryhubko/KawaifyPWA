import type { LocalTrackMetadata } from "../../types/track";

export type { LocalTrackMetadata };

export const SUPPORTED_AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
] as const;

export const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg", ".flac"] as const;

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
  title: string;
  artist: string;
  source: "local";
  fileName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  downloadUrl?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}
