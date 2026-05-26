/** Placeholder — Web Audio API equalizer & effects */
export function getDefaultEqualizerBands() {
  return [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000].map(
    (frequency) => ({ frequency, gain: 0 })
  );
}
