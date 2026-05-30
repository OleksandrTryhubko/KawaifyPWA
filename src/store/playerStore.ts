import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchAudiusTracks,
  formatAudiusDuration,
  getAudiusArtworkUrl,
  getAudiusStreamUrl,
} from "../api/audius";
import type { AudiusTrack } from "../types/audius";
import type { Track } from "../types/track";
import type {
  AbRepeatState,
  EqualizerBand,
  PlayTrackOptions,
  RepeatMode,
} from "../types/player";
import { createFlatBands } from "../types/player";
import { presetToBands, EQUALIZER_PRESETS } from "../features/audio-tools/equalizerPresets";
import { normalizeTrackForPlayback } from "../utils/trackAudioUrl";
import { cleanTrackForFirestore } from "../utils/firestoreClean";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export type { Track } from "../types/track";

const STORAGE_KEY = "kawaify-player-prefs";

interface UsePlayerStoreState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  tracks: Track[];
  isLoading: boolean;

  queue: Track[];
  queueIndex: number;
  shuffleEnabled: boolean;
  repeatMode: RepeatMode;
  abRepeat: AbRepeatState;
  equalizerBands: EqualizerBand[];
  equalizerMasterGain: number;
  equalizerPresetId: string;
  queuePanelOpen: boolean;
  equalizerOpen: boolean;

  setIsPlaying: (value: boolean) => void;
  togglePlayPause: () => void;
  setCurrentTrack: (track: Track) => Promise<void>;
  playTrack: (track: Track, options?: PlayTrackOptions) => Promise<void>;
  setTracks: (tracks: Track[]) => void;
  setVolume: (volume: number) => void;
  setIsLoading: (value: boolean) => void;
  loadTracksFromAudius: (query?: string) => Promise<void>;

  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  cycleRepeatMode: () => void;

  setAbPointA: (time: number) => void;
  setAbPointB: (time: number) => void;
  clearAbRepeat: () => void;
  toggleAbRepeatActive: () => void;

  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setQueuePanelOpen: (open: boolean) => void;
  setEqualizerOpen: (open: boolean) => void;

  setEqualizerBand: (index: number, gain: number) => void;
  setEqualizerBands: (bands: EqualizerBand[]) => void;
  setEqualizerMasterGain: (gain: number) => void;
  applyEqualizerPreset: (presetId: string) => void;
}

const saveTrackIfNeeded = async (track: Track) => {
  if (track.source === "local") return;
  const ref = doc(db, "songs", track.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const payload = cleanTrackForFirestore(track);
    try {
      await setDoc(ref, payload);
    } catch (e) {
      console.error(`Failed to save track ${track.title}:`, e, payload);
    }
  }
};

function mapAudiusToTrack(track: AudiusTrack): Track {
  return {
    id: track.id,
    title: track.title,
    artists: [track.user?.name ?? "Unknown"],
    genre: track.genre ?? "",
    duration:
      typeof track.duration === "number"
        ? formatAudiusDuration(track.duration)
        : "0:00",
    image: getAudiusArtworkUrl(track.artwork),
    streamUrl: track.stream_url ?? getAudiusStreamUrl(track.id),
    source: "audius",
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getNextIndex(
  queue: Track[],
  currentIndex: number,
  shuffle: boolean
): number | null {
  if (queue.length === 0) return null;
  if (shuffle) {
    if (queue.length === 1) return 0;
    let next = currentIndex;
    while (next === currentIndex) {
      next = Math.floor(Math.random() * queue.length);
    }
    return next;
  }
  if (currentIndex < queue.length - 1) return currentIndex + 1;
  return null;
}

function getPrevIndex(_queue: Track[], currentIndex: number): number | null {
  if (currentIndex > 0) return currentIndex - 1;
  return null;
}

export const usePlayerStore = create<UsePlayerStoreState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentTrack: null,
      volume: 1,
      tracks: [],
      isLoading: false,
      queue: [],
      queueIndex: -1,
      shuffleEnabled: false,
      repeatMode: "off",
      abRepeat: { pointA: null, pointB: null, active: false },
      equalizerBands: createFlatBands(),
      equalizerMasterGain: 1,
      equalizerPresetId: "flat",
      queuePanelOpen: false,
      equalizerOpen: false,

      setIsPlaying: (value) => set({ isPlaying: value }),
      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      setTracks: (tracks) => set({ tracks }),
      setVolume: (volume) => set({ volume }),
      setIsLoading: (value) => set({ isLoading: value }),
      setQueuePanelOpen: (open) => set({ queuePanelOpen: open }),
      setEqualizerOpen: (open) => set({ equalizerOpen: open }),

      setCurrentTrack: async (track) => {
        const normalized = normalizeTrackForPlayback(track);
        set({ currentTrack: normalized });
        await saveTrackIfNeeded(normalized);
      },

      playTrack: async (track, options) => {
        const normalized = normalizeTrackForPlayback(track);
        const { queue, appendToQueue } = options ?? {};
        let newQueue = queue ?? get().queue;
        let index = options?.index ?? -1;

        if (queue) {
          newQueue = queue.map(normalizeTrackForPlayback);
          index = index >= 0 ? index : newQueue.findIndex((t) => t.id === normalized.id);
        } else if (appendToQueue) {
          newQueue = [...get().queue, normalized];
          index = newQueue.length - 1;
        } else if (newQueue.length === 0) {
          newQueue = [normalized];
          index = 0;
        } else {
          const existing = newQueue.findIndex((t) => t.id === normalized.id);
          if (existing >= 0) {
            index = existing;
            newQueue = newQueue.map((t, i) => (i === existing ? normalized : t));
          } else {
            newQueue = [...newQueue, normalized];
            index = newQueue.length - 1;
          }
        }

        set({
          currentTrack: normalized,
          queue: newQueue,
          queueIndex: index >= 0 ? index : 0,
          isPlaying: true,
        });
        await saveTrackIfNeeded(normalized);
      },

      playNext: () => {
        const { queue, queueIndex, shuffleEnabled, repeatMode, currentTrack } = get();
        if (queue.length === 0 || !currentTrack) return;

        if (repeatMode === "track") {
          set({ isPlaying: true });
          return;
        }

        const nextIdx = getNextIndex(queue, queueIndex, shuffleEnabled);
        if (nextIdx !== null) {
          set({ currentTrack: queue[nextIdx], queueIndex: nextIdx, isPlaying: true });
          return;
        }

        if (repeatMode === "playlist" && queue.length > 0) {
          const idx = shuffleEnabled ? Math.floor(Math.random() * queue.length) : 0;
          set({ currentTrack: queue[idx], queueIndex: idx, isPlaying: true });
          return;
        }
        set({ isPlaying: false });
      },

      playPrevious: () => {
        const { queue, queueIndex } = get();
        const prevIdx = getPrevIndex(queue, queueIndex);
        if (prevIdx !== null) {
          set({ currentTrack: queue[prevIdx], queueIndex: prevIdx, isPlaying: true });
        }
      },

      toggleShuffle: () => set((s) => ({ shuffleEnabled: !s.shuffleEnabled })),
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      cycleRepeatMode: () =>
        set((s) => {
          const order: RepeatMode[] = ["off", "playlist", "track"];
          const i = order.indexOf(s.repeatMode);
          return { repeatMode: order[(i + 1) % order.length] };
        }),

      setAbPointA: (time) =>
        set((s) => ({
          abRepeat: { ...s.abRepeat, pointA: time, active: s.abRepeat.active },
        })),
      setAbPointB: (time) =>
        set((s) => ({
          abRepeat: { ...s.abRepeat, pointB: time, active: s.abRepeat.active },
        })),
      clearAbRepeat: () =>
        set({ abRepeat: { pointA: null, pointB: null, active: false } }),
      toggleAbRepeatActive: () =>
        set((s) => {
          const { pointA, pointB } = s.abRepeat;
          if (pointA == null || pointB == null) return s;
          return { abRepeat: { ...s.abRepeat, active: !s.abRepeat.active } };
        }),

      setQueue: (tracks, startIndex = 0) => {
        const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
        set({
          queue: tracks,
          queueIndex: tracks.length ? idx : -1,
          currentTrack: tracks[idx] ?? get().currentTrack,
        });
      },

      addToQueue: (track) =>
        set((s) => ({
          queue: [...s.queue, track],
        })),

      removeFromQueue: (index) =>
        set((s) => {
          const queue = s.queue.filter((_, i) => i !== index);
          let queueIndex = s.queueIndex;
          if (index < queueIndex) queueIndex -= 1;
          else if (index === queueIndex) {
            queueIndex = Math.min(queueIndex, queue.length - 1);
          }
          return { queue, queueIndex };
        }),

      reorderQueue: (fromIndex, toIndex) =>
        set((s) => {
          const queue = [...s.queue];
          const [item] = queue.splice(fromIndex, 1);
          queue.splice(toIndex, 0, item);
          let queueIndex = s.queueIndex;
          if (fromIndex === queueIndex) queueIndex = toIndex;
          else if (fromIndex < queueIndex && toIndex >= queueIndex) queueIndex -= 1;
          else if (fromIndex > queueIndex && toIndex <= queueIndex) queueIndex += 1;
          return { queue, queueIndex };
        }),

      clearQueue: () => set({ queue: [], queueIndex: -1 }),

      setEqualizerBand: (index, gain) =>
        set((s) => {
          const bands = s.equalizerBands.map((b, i) =>
            i === index ? { ...b, gain } : b
          );
          return { equalizerBands: bands, equalizerPresetId: "custom" };
        }),

      setEqualizerBands: (bands) =>
        set({ equalizerBands: bands, equalizerPresetId: "custom" }),

      setEqualizerMasterGain: (gain) => set({ equalizerMasterGain: gain }),

      applyEqualizerPreset: (presetId) => {
        const preset = EQUALIZER_PRESETS.find((p) => p.id === presetId);
        if (!preset) return;
        set({
          equalizerBands: presetToBands(preset),
          equalizerPresetId: presetId,
        });
      },

      loadTracksFromAudius: async (query = "lofi") => {
        set({ isLoading: true });
        try {
          const data = await fetchAudiusTracks(query, 40);
          const formatted = data.map(mapAudiusToTrack);
          set({ tracks: formatted });
          formatted.forEach(saveTrackIfNeeded);
        } catch (e) {
          console.error("Error when downloading tracks from Audius:", e);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        shuffleEnabled: state.shuffleEnabled,
        repeatMode: state.repeatMode,
        equalizerBands: state.equalizerBands,
        equalizerMasterGain: state.equalizerMasterGain,
        equalizerPresetId: state.equalizerPresetId,
        volume: state.volume,
      }),
    }
  )
);

/** Build shuffled queue from track list and start playback */
export function playTracksFromList(
  tracks: Track[],
  startTrack: Track,
  shuffle = false
): void {
  const normalized = tracks.map(normalizeTrackForPlayback);
  const start = normalizeTrackForPlayback(startTrack);
  const list = shuffle ? shuffleArray(normalized) : normalized;
  const index = list.findIndex((t) => t.id === start.id);
  void usePlayerStore.getState().playTrack(start, {
    queue: list,
    index: index >= 0 ? index : 0,
  });
}
