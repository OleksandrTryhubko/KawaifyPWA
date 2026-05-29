import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "./useAuth";
import { usePlayerStore } from "../store/playerStore";
import { incrementListeningStats } from "../services/userService";

const FLUSH_EVERY_SECONDS = 30;

export function useListeningTracker() {
  const { user, refreshUser } = useAuth();
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  const pendingSecondsRef = useRef(0);
  const lastCountedTrackIdRef = useRef<string | null>(null);
  const flushingRef = useRef(false);

  const flush = useCallback(
    async (trackStarted = false) => {
      if (!user?.uid || flushingRef.current) return;

      const seconds = pendingSecondsRef.current;
      if (seconds <= 0 && !trackStarted) return;

      flushingRef.current = true;
      pendingSecondsRef.current = 0;

      try {
        await incrementListeningStats(user.uid, seconds, trackStarted);
        await refreshUser();
      } catch {
        pendingSecondsRef.current += seconds;
      } finally {
        flushingRef.current = false;
      }
    },
    [user?.uid, refreshUser]
  );

  useEffect(() => {
    if (!user?.uid || !currentTrack || !isPlaying) return;
    if (currentTrack.id === lastCountedTrackIdRef.current) return;

    lastCountedTrackIdRef.current = currentTrack.id;

    void (async () => {
      if (pendingSecondsRef.current > 0) {
        await flush(false);
      }
      await flush(true);
    })();
  }, [currentTrack?.id, isPlaying, user?.uid, flush]);

  useEffect(() => {
    if (!user?.uid || !currentTrack || !isPlaying) return;

    const intervalId = window.setInterval(() => {
      pendingSecondsRef.current += 1;
      if (pendingSecondsRef.current >= FLUSH_EVERY_SECONDS) {
        void flush(false);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [user?.uid, currentTrack?.id, isPlaying, flush]);

  useEffect(() => {
    if (!isPlaying && pendingSecondsRef.current > 0) {
      void flush(false);
    }
  }, [isPlaying, flush]);

  useEffect(() => {
    if (!currentTrack) {
      lastCountedTrackIdRef.current = null;
    }
  }, [currentTrack]);

  useEffect(() => {
    return () => {
      const seconds = pendingSecondsRef.current;
      if (seconds > 0 && user?.uid) {
        void incrementListeningStats(user.uid, seconds);
      }
    };
  }, [user?.uid]);
}
