import type { EqualizerBand } from "../../types/player";
import { EQ_FREQUENCIES } from "../../types/player";

const MIN_GAIN = -12;
const MAX_GAIN = 12;

export class AudioEffectsService {
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private connectedElement: HTMLAudioElement | null = null;

  connect(audio: HTMLAudioElement): AudioContext {
    if (this.connectedElement === audio && this.context) {
      return this.context;
    }

    if (this.context && this.connectedElement !== audio) {
      this.disconnect();
    }

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    const filters = EQ_FREQUENCIES.map((freq) => {
      const f = ctx.createBiquadFilter();
      f.type = "peaking";
      f.frequency.value = freq;
      f.Q.value = 1.2;
      f.gain.value = 0;
      return f;
    });

    const gainNode = ctx.createGain();
    gainNode.gain.value = 1;

    let prev: AudioNode = source;
    for (const filter of filters) {
      prev.connect(filter);
      prev = filter;
    }
    prev.connect(gainNode);
    gainNode.connect(ctx.destination);

    this.context = ctx;
    this.source = source;
    this.filters = filters;
    this.gainNode = gainNode;
    this.connectedElement = audio;

    return ctx;
  }

  async resume(): Promise<void> {
    if (this.context?.state === "suspended") {
      await this.context.resume();
    }
  }

  getState(): AudioContextState | "disconnected" {
    return this.context?.state ?? "disconnected";
  }

  setBandGain(index: number, gainDb: number): void {
    const filter = this.filters[index];
    if (!filter) return;
    filter.gain.value = Math.max(MIN_GAIN, Math.min(MAX_GAIN, gainDb));
  }

  applyBands(bands: EqualizerBand[]): void {
    bands.forEach((band, i) => {
      const filter = this.filters[i];
      if (filter) {
        filter.frequency.value = band.frequency;
        filter.gain.value = Math.max(MIN_GAIN, Math.min(MAX_GAIN, band.gain));
      }
    });
  }

  setMasterGain(linear: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(2, linear));
    }
  }

  getAnalyser(): AnalyserNode | null {
    if (!this.context || !this.gainNode) return null;
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 256;
    this.gainNode.connect(analyser);
    return analyser;
  }

  disconnect(): void {
    try {
      this.source?.disconnect();
      this.filters.forEach((f) => f.disconnect());
      this.gainNode?.disconnect();
      void this.context?.close();
    } catch {
      /* already torn down */
    }
    this.context = null;
    this.source = null;
    this.filters = [];
    this.gainNode = null;
    this.connectedElement = null;
  }
}

export const audioEffectsService = new AudioEffectsService();
