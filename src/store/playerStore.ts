import { create } from "zustand";
import {
  fetchAudiusTracks,
  formatAudiusDuration,
  getAudiusArtworkUrl,
  getAudiusStreamUrl,
} from "../api/audius";
import type { AudiusTrack } from "../types/audius";
import type { Track } from "../types/track";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export type { Track } from "../types/track";

interface UsePlayerStoreState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number;
  tracks: Track[];
  isLoading: boolean;

  setIsPlaying: (value: boolean) => void;
  togglePlayPause: () => void;
  setCurrentTrack: (track: Track) => Promise<void>;
  setTracks: (tracks: Track[]) => void;
  setVolume: (volume: number) => void;
  setIsLoading: (value: boolean) => void;

  loadTracksFromAudius: (query?: string) => Promise<void>;
}

const saveTrackIfNeeded = async (track: Track) => {
  const ref = doc(db, "songs", track.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    try {
      await setDoc(ref, track);
    } catch (e) {
      console.error(`Failed to save track ${track.title}:`, e);
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

export const usePlayerStore = create<UsePlayerStoreState>()((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 1,
  tracks: [],
  isLoading: false,

  setIsPlaying: (value) => set({ isPlaying: value }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setTracks: (tracks) => set({ tracks }),
  setVolume: (volume) => set({ volume }),
  setIsLoading: (value) => set({ isLoading: value }),

  setCurrentTrack: async (track) => {
    set({ currentTrack: track });
    await saveTrackIfNeeded(track);
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
}));
