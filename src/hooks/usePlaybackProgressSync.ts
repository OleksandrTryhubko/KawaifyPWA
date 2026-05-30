import { useEffect } from "react";
import { audioElementRef } from "../lib/audioElementRef";
import { usePlayerStore } from "../store/playerStore";
import { parseDurationToSeconds } from "../utils/duration";
import type { Track } from "../types/track";

function fallbackDurationSeconds(track: Track | null): number {
  if (!track?.duration) return 0;
  return parseDurationToSeconds(track.duration);
}

function resolveDuration(
  el: HTMLAudioElement,
  track: Track | null
): number {
  const fromElement = el.duration;
  if (Number.isFinite(fromElement) && fromElement > 0) {
    return fromElement;
  }
  return fallbackDurationSeconds(track);
}

let lastProgressLogAt = 0;

function logProgressDebug(payload: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return;
  const now = Date.now();
  if (now - lastProgressLogAt < 1000) return;
  lastProgressLogAt = now;
  console.debug("[Kawaify player]", payload);
}

/**
 * Keeps playback progress in the store from the active HTMLAudioElement.
 * Called from useAudioEngine so listeners always attach to the real playing element.
 */
export function usePlaybackProgressSync(
  eqAudio: HTMLAudioElement | null,
  localAudio: HTMLAudioElement | null,
  audioMountGeneration: number
): void {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  useEffect(() => {
    const track = usePlayerStore.getState().currentTrack;
    if (!track) {
      usePlayerStore.getState().resetPlaybackProgress();
      return;
    }

    const fallback = fallbackDurationSeconds(track);
    if (fallback > 0) {
      usePlayerStore.getState().setPlaybackProgress(0, fallback);
    } else {
      usePlayerStore.getState().resetPlaybackProgress();
    }
  }, [currentTrack?.id, currentTrack?.source]);

  useEffect(() => {
    const elements = [eqAudio, localAudio].filter(
      (el): el is HTMLAudioElement => el != null
    );

    if (elements.length === 0) return;

    const pushFromElement = (el: HTMLAudioElement) => {
      if (audioElementRef.current !== el) return;

      const track = usePlayerStore.getState().currentTrack;
      const currentTime = Number.isFinite(el.currentTime) ? el.currentTime : 0;
      const duration = resolveDuration(el, track);
      usePlayerStore.getState().setPlaybackProgress(currentTime, duration);

      const progress =
        duration > 0 ? Math.round((currentTime / duration) * 1000) / 10 : 0;
      logProgressDebug({
        currentTime,
        duration,
        progressPercent: progress,
        source: track?.source ?? null,
        paused: el.paused,
      });
    };

    const cleanups = elements.map((el) => {
      const onUpdate = () => pushFromElement(el);
      el.addEventListener("timeupdate", onUpdate);
      el.addEventListener("loadedmetadata", onUpdate);
      el.addEventListener("durationchange", onUpdate);
      el.addEventListener("seeked", onUpdate);
      el.addEventListener("progress", onUpdate);
      onUpdate();
      return () => {
        el.removeEventListener("timeupdate", onUpdate);
        el.removeEventListener("loadedmetadata", onUpdate);
        el.removeEventListener("durationchange", onUpdate);
        el.removeEventListener("seeked", onUpdate);
        el.removeEventListener("progress", onUpdate);
      };
    });

    let rafId = 0;
    const tick = () => {
      if (usePlayerStore.getState().isPlaying) {
        const active = audioElementRef.current;
        if (active) pushFromElement(active);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
    };
  }, [
    eqAudio,
    localAudio,
    currentTrack?.id,
    currentTrack?.source,
    isPlaying,
    audioMountGeneration,
  ]);
}
