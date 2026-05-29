import type { Track } from "./track";

export type RepeatMode = "off" | "playlist" | "track";

export interface AbRepeatState {
  pointA: number | null;
  pointB: number | null;
  active: boolean;
}

export interface PlayTrackOptions {
  /** Full list for next/prev navigation */
  queue?: Track[];
  /** Index of track in queue */
  index?: number;
  /** Append to existing queue instead of replacing */
  appendToQueue?: boolean;
}

export interface EqualizerBand {
  frequency: number;
  gain: number;
}

export const EQ_FREQUENCIES = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const;

export function createFlatBands(): EqualizerBand[] {
  return EQ_FREQUENCIES.map((frequency) => ({ frequency, gain: 0 }));
}
