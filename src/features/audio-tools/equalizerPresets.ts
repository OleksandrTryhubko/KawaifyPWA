import type { EqualizerBand } from "../../types/player";
import { EQ_FREQUENCIES } from "../../types/player";

export interface EqualizerPreset {
  id: string;
  name: string;
  gains: number[];
}

function preset(id: string, name: string, gains: number[]): EqualizerPreset {
  return { id, name, gains };
}

/** Gains in dB for 31…16k Hz bands */
export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  preset("flat", "Flat", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  preset("rock", "Rock", [5, 4, 2, 0, -1, 0, 2, 4, 5, 5]),
  preset("pop", "Pop", [-1, 1, 3, 4, 3, 1, 0, -1, -1, -1]),
  preset("jazz", "Jazz", [3, 2, 1, 2, -1, -1, 0, 1, 2, 3]),
  preset("bass", "Bass Boost", [8, 6, 4, 2, 0, 0, 0, 0, 0, 0]),
  preset("vocal", "Vocal", [-2, -1, 0, 2, 4, 4, 3, 2, 1, 0]),
  preset("electronic", "Electronic", [5, 4, 1, 0, -2, 0, 1, 3, 5, 6]),
];

export function presetToBands(p: EqualizerPreset): EqualizerBand[] {
  return EQ_FREQUENCIES.map((frequency, i) => ({
    frequency,
    gain: p.gains[i] ?? 0,
  }));
}

export function bandsMatchPreset(bands: EqualizerBand[], presetId: string): boolean {
  const p = EQUALIZER_PRESETS.find((x) => x.id === presetId);
  if (!p) return false;
  return bands.every((b, i) => Math.abs(b.gain - (p.gains[i] ?? 0)) < 0.5);
}
