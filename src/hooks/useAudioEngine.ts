import { useEffect, useRef } from "react";
import { usePlayerStore } from "../store/playerStore";
import { audioEffectsService } from "../features/audio-tools/audioEffectsService";
import { audioElementRef } from "../lib/audioElementRef";
import {
  getTrackAudioUrl,
  resolvePlayableUrl,
  applyAudioCrossOrigin,
  isLocalTrack,
  logLocalPlaybackDiagnostics,
} from "../utils/trackAudioUrl";
import { clamp01 } from "../utils/clamp01";
import { useToast } from "./useToast";

const DEV = import.meta.env.DEV;

function debugAudio(payload: Record<string, unknown>): void {
  if (DEV) {
    console.debug("[Kawaify audio]", payload);
  }
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export function useAudioEngine() {
  const eqAudioRef = useRef<HTMLAudioElement | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const publicRef = useRef<HTMLAudioElement | null>(null);
  const eqWiredRef = useRef(false);
  const loadGenRef = useRef(0);
  const trackLoadingRef = useRef(false);
  const loadedTrackKeyRef = useRef("");
  const prevIsPlayingRef = useRef(false);
  const toast = useToast();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const equalizerMasterGain = usePlayerStore((s) => s.equalizerMasterGain);
  const equalizerBands = usePlayerStore((s) => s.equalizerBands);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const playNext = usePlayerStore((s) => s.playNext);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);

  const pickActive = (): HTMLAudioElement | null => {
    if (!currentTrack) return null;
    return isLocalTrack(currentTrack) ? localAudioRef.current : eqAudioRef.current;
  };

  const syncPublicRef = () => {
    const active = pickActive();
    publicRef.current = active;
    audioElementRef.current = active;
    return active;
  };

  const applyVolume = (track: typeof currentTrack) => {
    if (!track) return;
    if (isLocalTrack(track) && localAudioRef.current) {
      localAudioRef.current.volume = clamp01(volume);
    } else {
      if (eqAudioRef.current) {
        eqAudioRef.current.volume = 1;
      }
      audioEffectsService.setMasterGain(Math.max(0, equalizerMasterGain * volume));
    }
  };

  const handlePlayFailure = (
    err: unknown,
    track: typeof currentTrack,
    audio: HTMLAudioElement,
    src?: string
  ) => {
    if (isAbortError(err)) {
      debugAudio({ event: "play-aborted" });
      return;
    }
    console.warn("[Kawaify] audio.play() failed:", err);
    if (track) {
      logLocalPlaybackDiagnostics(track, src ?? audio.src, audio);
    }
    if (track && isLocalTrack(track)) {
      toast.error("Cannot play this local track. Audio URL is missing or unavailable.");
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!eqAudioRef.current) {
      eqAudioRef.current = new Audio();
    }
    if (!localAudioRef.current) {
      localAudioRef.current = new Audio();
    }
    if (!eqWiredRef.current && eqAudioRef.current) {
      eqWiredRef.current = true;
      try {
        audioEffectsService.connect(eqAudioRef.current);
      } catch (e) {
        console.warn("[Kawaify] Web Audio init failed:", e);
      }
    }
    syncPublicRef();
  }, []);

  useEffect(() => {
    syncPublicRef();
  }, [currentTrack?.id, currentTrack?.source]);

  useEffect(() => {
    if (!currentTrack || isLocalTrack(currentTrack)) return;
    audioEffectsService.applyBands(equalizerBands);
  }, [equalizerBands, currentTrack?.source]);

  useEffect(() => {
    applyVolume(currentTrack);
    debugAudio({
      event: "volume",
      source: currentTrack?.source ?? null,
      volume,
      audioVolume: isLocalTrack(currentTrack)
        ? localAudioRef.current?.volume
        : eqAudioRef.current?.volume,
      masterGain: equalizerMasterGain * volume,
    });
  }, [equalizerMasterGain, volume, currentTrack?.source]);

  useEffect(() => {
    const audio = pickActive();
    if (!audio || !currentTrack) return;

    const other = isLocalTrack(currentTrack) ? eqAudioRef.current : localAudioRef.current;
    other?.pause();

    const gen = ++loadGenRef.current;
    let cancelled = false;

    void (async () => {
      trackLoadingRef.current = true;

      const remoteUrl = getTrackAudioUrl(currentTrack);
      if (!remoteUrl) {
        console.warn("[Kawaify] Missing audio URL:", currentTrack.id, currentTrack.title);
        toast.error("Cannot play this local track. Audio URL is missing or unavailable.");
        setIsPlaying(false);
        trackLoadingRef.current = false;
        return;
      }

      const playableSrc = await resolvePlayableUrl(currentTrack);
      if (cancelled || gen !== loadGenRef.current) {
        trackLoadingRef.current = false;
        return;
      }

      const trackKey = `${currentTrack.id}:${playableSrc}`;
      const urlChanged = loadedTrackKeyRef.current !== trackKey;

      if (!urlChanged) {
        applyVolume(currentTrack);
        syncPublicRef();
        if (usePlayerStore.getState().isPlaying && audio.paused) {
          try {
            await audio.play();
          } catch (err) {
            handlePlayFailure(err, currentTrack, audio, playableSrc);
          }
        }
        debugAudio({
          event: "track-skip-reload",
          source: currentTrack.source,
          urlChanged: false,
          isPlaying: usePlayerStore.getState().isPlaying,
          volume,
          audioVolume: audio.volume,
          masterGain: equalizerMasterGain * volume,
        });
        trackLoadingRef.current = false;
        return;
      }

      applyAudioCrossOrigin(audio, playableSrc, currentTrack);
      audio.muted = false;
      applyVolume(currentTrack);

      if (!isLocalTrack(currentTrack)) {
        await audioEffectsService.resume();
      }

      audio.src = playableSrc;
      audio.load();
      loadedTrackKeyRef.current = trackKey;
      syncPublicRef();

      debugAudio({
        event: "track-load",
        source: currentTrack.source,
        urlChanged: true,
        isPlaying: usePlayerStore.getState().isPlaying,
        volume,
        audioVolume: audio.volume,
        masterGain: equalizerMasterGain * volume,
      });

      if (usePlayerStore.getState().isPlaying) {
        try {
          await audio.play();
        } catch (err) {
          handlePlayFailure(err, currentTrack, audio, playableSrc);
        }
      }

      trackLoadingRef.current = false;
    })();

    return () => {
      cancelled = true;
    };
  }, [
    currentTrack?.id,
    currentTrack?.streamUrl,
    currentTrack?.downloadUrl,
    currentTrack?.source,
    toast,
    setIsPlaying,
  ]);

  useEffect(() => {
    prevIsPlayingRef.current = isPlaying;
  }, [currentTrack?.id]);

  useEffect(() => {
    const audio = pickActive();
    if (!audio || !currentTrack) return;

    const wasPlaying = prevIsPlayingRef.current;
    prevIsPlayingRef.current = isPlaying;

    if (wasPlaying === isPlaying) return;

    if (isPlaying) {
      if (trackLoadingRef.current || !audio.src) return;

      const play = async () => {
        if (!isLocalTrack(currentTrack)) {
          await audioEffectsService.resume();
        }
        try {
          await audio.play();
        } catch (err) {
          handlePlayFailure(err, currentTrack, audio);
        }
      };
      void play();
    } else {
      audio.pause();
    }

    debugAudio({
      event: "play-pause",
      source: currentTrack.source,
      isPlaying,
      volume,
      audioVolume: audio.volume,
      masterGain: equalizerMasterGain * volume,
    });
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    const attach = (audio: HTMLAudioElement) => {
      const onError = () => {
        const code = audio.error?.code;
        console.warn(
          "[Kawaify] Audio error:",
          code,
          audio.error?.message,
          audio.src
        );
        if (currentTrack && isLocalTrack(currentTrack)) {
          logLocalPlaybackDiagnostics(currentTrack, audio.src, audio);
          toast.error("Cannot play this local track. Audio URL is missing or unavailable.");
          setIsPlaying(false);
        } else if (code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
          toast.error("Cannot play this track. The audio format is not supported.");
          setIsPlaying(false);
        }
      };

      const onEnded = () => {
        if (pickActive() !== audio) return;
        if (repeatMode === "track" && currentTrack) {
          audio.currentTime = 0;
          audio.play().catch((err) => {
            if (!isAbortError(err)) console.warn("[Kawaify] repeat play failed:", err);
          });
          return;
        }
        playNext();
      };

      const onTimeUpdate = () => {
        if (pickActive() !== audio) return;
        const { abRepeat: ab } = usePlayerStore.getState();
        if (!ab.active || ab.pointA == null || ab.pointB == null) return;
        const a = Math.min(ab.pointA, ab.pointB);
        const b = Math.max(ab.pointA, ab.pointB);
        if (audio.currentTime >= b) {
          audio.currentTime = a;
        }
      };

      audio.addEventListener("error", onError);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("timeupdate", onTimeUpdate);
      return () => {
        audio.removeEventListener("error", onError);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("timeupdate", onTimeUpdate);
      };
    };

    const cleanEq = eqAudioRef.current ? attach(eqAudioRef.current) : undefined;
    const cleanLocal = localAudioRef.current ? attach(localAudioRef.current) : undefined;
    return () => {
      cleanEq?.();
      cleanLocal?.();
    };
  }, [playNext, repeatMode, currentTrack, toast, setIsPlaying]);

  return { audioRef: publicRef };
}
