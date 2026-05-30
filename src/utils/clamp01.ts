/** Clamp a number to the HTMLMediaElement.volume range [0, 1]. NaN/Infinity → fallback. */
export function clamp01(value: number, fallback = 1): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

/** Clamp to [min, max]; non-finite values use fallback. */
export function clampFinite(
  value: number,
  min: number,
  max: number,
  fallback: number
): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

/** Master gain for Web Audio GainNode (EQ master × volume slider). */
export function computeMasterGain(
  equalizerMasterGain: number,
  volume: number
): number {
  const vol = clamp01(volume, 1);
  const eq = clampFinite(equalizerMasterGain, 0, 2, 1);
  return clampFinite(eq * vol, 0, 2, vol);
}
