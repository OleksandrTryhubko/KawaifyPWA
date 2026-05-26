export interface EqualizerBand {
  frequency: number;
  gain: number;
}

export interface AudioEffectPreset {
  id: string;
  name: string;
  bands: EqualizerBand[];
}
