import type { AudiusSearchResponse, AudiusTrack } from "../types/audius";

const BASE_URL = "https://discoveryprovider.audius.co/v1";
const APP_NAME = "kawaify";

export type { AudiusTrack, AudiusUser, AudiusArtwork } from "../types/audius";

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(Math.floor(limit), 100);
}

export function getAudiusArtworkUrl(
  artwork?: AudiusTrack["artwork"]
): string {
  return (
    artwork?.["480x480"] ||
    artwork?.["150x150"] ||
    artwork?.["1000x1000"] ||
    ""
  );
}

export function getAudiusStreamUrl(trackId: string): string {
  return `${BASE_URL}/tracks/${trackId}/stream?app_name=${APP_NAME}`;
}

export function formatAudiusDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function fetchAudiusTracks(
  query = "lofi",
  limit = 20
): Promise<AudiusTrack[]> {
  const safeLimit = clampLimit(limit);
  const encodedQuery = encodeURIComponent(query.trim() || "lofi");

  const res = await fetch(
    `${BASE_URL}/tracks/search?query=${encodedQuery}&limit=${safeLimit}&app_name=${APP_NAME}`
  );

  if (!res.ok) {
    throw new Error(`Audius API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as AudiusSearchResponse;

  if (!data.data || !Array.isArray(data.data)) {
    return [];
  }

  return data.data;
}
