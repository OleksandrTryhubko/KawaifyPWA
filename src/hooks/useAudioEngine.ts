import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";
import { audioEffectsService } from "../features/audio-tools/audioEffectsService";

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wiredRef = useRef(false);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const equalizerBands = usePlayerStore((s) => s.equalizerBands);
  const equalizerMasterGain = usePlayerStore((s) => s.equalizerMasterGain);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const playNext = usePlayerStore((s) => s.playNext);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }
    if (!wiredRef.current) {
      wiredRef.current = true;
      try {
        audioEffectsService.connect(audioRef.current);
      } catch (e) {
        console.warn("Web Audio init:", e);
      }
    }
  }, []);

  useEffect(() => {
    audioEffectsService.applyBands(equalizerBands);
  }, [equalizerBands]);

  useEffect(() => {
    audioEffectsService.setMasterGain(equalizerMasterGain);
  }, [equalizerMasterGain]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.streamUrl;
    audio.load();
    void audioEffectsService.resume();

    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentTrack?.id, currentTrack?.streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      void audioEffectsService.resume();
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatMode === "track" && currentTrack) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }
      playNext();
    };

    const onTimeUpdate = () => {
      const { abRepeat: ab } = usePlayerStore.getState();
      if (!ab.active || ab.pointA == null || ab.pointB == null) return;
      const a = Math.min(ab.pointA, ab.pointB);
      const b = Math.max(ab.pointA, ab.pointB);
      if (audio.currentTime >= b) {
        audio.currentTime = a;
      }
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [playNext, repeatMode, currentTrack]);

  return { audioRef };
}
