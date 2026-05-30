/** Clamp a number to the HTMLMediaElement.volume range [0, 1]. */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
