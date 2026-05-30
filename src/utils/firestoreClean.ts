import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";
import type { LocalTrackMetadataDoc } from "../features/local-music/types";

/** Remove keys with `undefined` values (Firestore rejects undefined). */
export function removeUndefinedFields<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

export function cleanTrackForFirestore(track: Track): Record<string, unknown> {
  return removeUndefinedFields({
    id: track.id,
    title: track.title,
    artists: track.artists,
    genre: track.genre,
    duration: track.duration,
    image: track.image,
    streamUrl: track.streamUrl,
    source: track.source,
    fileName: track.fileName,
    mimeType: track.mimeType,
    size: track.size,
    storagePath: track.storagePath,
  });
}

export function cleanPlaylistForFirestore(playlist: Playlist): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: playlist.id,
    title: playlist.title,
    trackIds: playlist.trackIds ?? [],
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  };

  if (playlist.accentColor) base.accentColor = playlist.accentColor;
  if (playlist.coverUrl) base.coverUrl = playlist.coverUrl;
  if (playlist.image) base.image = playlist.image;
  if (playlist.coverPath) base.coverPath = playlist.coverPath;
  if (playlist.description?.trim()) base.description = playlist.description.trim();
  if (playlist.ownerId) base.ownerId = playlist.ownerId;

  return removeUndefinedFields(base);
}

export function cleanLocalTrackForFirestore(
  track: LocalTrackMetadataDoc
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: track.id,
    userId: track.userId,
    title: track.title,
    artist: track.artist,
    source: track.source,
    fileName: track.fileName,
    mimeType: track.mimeType,
    size: track.size,
    storagePath: track.storagePath,
    downloadUrl: track.downloadUrl,
  };

  if (track.duration) base.duration = track.duration;
  if (track.coverUrl) base.coverUrl = track.coverUrl;
  if (track.coverPath) base.coverPath = track.coverPath;
  if (track.createdAt !== undefined) base.createdAt = track.createdAt;
  if (track.updatedAt !== undefined) base.updatedAt = track.updatedAt;

  return removeUndefinedFields(base);
}
