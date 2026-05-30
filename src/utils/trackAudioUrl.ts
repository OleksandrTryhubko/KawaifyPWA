import type { Track } from "../types/track";

type TrackWithUrls = Track & { downloadUrl?: string; url?: string };

export function getTrackAudioUrl(track: Track | null | undefined): string {
  if (!track) return "";
  const t = track as TrackWithUrls;
  return (
    t.streamUrl?.trim() ||
    t.downloadUrl?.trim() ||
    t.objectUrl?.trim() ||
    t.url?.trim() ||
    ""
  );
}

export const getPlayableUrl = getTrackAudioUrl;

export function normalizeTrackForPlayback(track: Track): Track {
  const t = track as TrackWithUrls;
  const audioUrl = getTrackAudioUrl(track);
  const normalized: Track = {
    ...track,
    streamUrl: audioUrl || track.streamUrl,
  };
  if (isLocalTrack(track) && audioUrl) {
    normalized.downloadUrl = t.downloadUrl || audioUrl;
  }
  if (t.objectUrl) {
    normalized.objectUrl = t.objectUrl;
  }
  return normalized;
}

export function isLocalTrack(track: Track | null | undefined): boolean {
  return track?.source === "local";
}

/** Local tracks: direct Firebase downloadUrl (no blob fetch — avoids CORS failures). */
export async function resolvePlayableUrl(track: Track): Promise<string> {
  return getTrackAudioUrl(track);
}

/** Local Firebase URLs: no crossOrigin (no Storage CORS required for element playback). */
export function applyAudioCrossOrigin(
  audio: HTMLAudioElement,
  src: string,
  track: Track
): void {
  if (isLocalTrack(track) || src.startsWith("blob:")) {
    audio.removeAttribute("crossorigin");
  } else {
    audio.crossOrigin = "anonymous";
  }
}

export function logLocalPlaybackDiagnostics(
  track: Track,
  resolvedUrl: string,
  audio: HTMLAudioElement
): void {
  if (!isLocalTrack(track)) return;
  console.warn("[Kawaify local playback]", {
    source: track.source,
    streamUrl: track.streamUrl,
    downloadUrl: (track as TrackWithUrls).downloadUrl,
    resolvedUrl: resolvedUrl.slice(0, 120),
    error: audio.error?.code ?? null,
    message: audio.error?.message ?? null,
  });
}
