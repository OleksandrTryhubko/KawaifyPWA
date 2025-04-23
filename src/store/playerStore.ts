import { create } from "zustand";
import { fetchAudiusTracks } from "../api/audius";
import { db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// 🔄 ОНОВЛЕНО: `artists: string[]`
export interface Track {
  id: string;
  title: string;
  artists: string[]; // ✅ масив артистів
  genre?: string;
  duration: string;
  image: string;
  streamUrl: string;
  source: string;
}

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

// Зберігає трек у Firestore, якщо його ще немає
const saveTrackIfNeeded = async (track: Track) => {
  const ref = doc(db, "songs", track.id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    try {
      await setDoc(ref, track);
    } catch (e) {
      console.error(`Не вдалося зберегти трек ${track.title}:`, e);
    }
  }
};

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

      // 🔄 ОНОВЛЕНО: формування треків з масивом артистів
      const formatted: Track[] = data.map((track: any) => ({
        id: track.id,
        title: track.title,
        artists: [track.user?.name ?? "Unknown"], // ✅ тут!
        genre: track.genre ?? "",
        duration: track.duration ?? "0:00",
        image:
          track.artwork?.["480x480"] ||
          track.artwork?.["150x150"] ||
          "fallback.jpg",
        streamUrl: track.stream_url,
        source: "audius",
      }));

      set({ tracks: formatted });

      formatted.forEach(saveTrackIfNeeded);
    } catch (e) {
      console.error("Помилка при завантаженні треків з Audius:", e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
