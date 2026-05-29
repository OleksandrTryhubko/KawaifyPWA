import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { usePlayerStore } from "../store/playerStore";
import { recordRecentlyPlayed } from "../services/recentlyPlayedService";

/** Records recently played when a new track starts playing. */
export function useRecordRecentlyPlayed() {
  const { user } = useAuth();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const lastRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.uid || !currentTrack || !isPlaying) return;
    if (lastRecordedRef.current === currentTrack.id) return;

    lastRecordedRef.current = currentTrack.id;
    void recordRecentlyPlayed(user.uid, currentTrack);
  }, [user?.uid, currentTrack, isPlaying]);
}
