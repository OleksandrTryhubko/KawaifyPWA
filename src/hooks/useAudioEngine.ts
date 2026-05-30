import { useEffect, useRef, useState } from "react";
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
import { clamp01, computeMasterGain } from "../utils/clamp01";
import { useToast } from "./useToast";
import { usePlaybackProgressSync } from "./usePlaybackProgressSync";

const DEV = import.meta.env.DEV;
const AUDIUS_UNAVAILABLE_MSG = "This Audius track is unavailable. Try another one.";

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
  const lastErrorToastTrackIdRef = useRef<string | null>(null);
  const [audioMountGeneration, setAudioMountGeneration] = useState(0);
  const toast = useToast();

  const bumpAudioMount = () => setAudioMountGeneration((g) => g + 1);

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
    if (active) {
      const duration =
        Number.isFinite(active.duration) && active.duration > 0
          ? active.duration
          : 0;
      usePlayerStore
        .getState()
        .setPlaybackProgress(active.currentTime || 0, duration);
    }
    return active;
  };

  usePlaybackProgressSync(
    eqAudioRef.current,
    localAudioRef.current,
    audioMountGeneration
  );

  const connectEqEffects = () => {
    const eq = eqAudioRef.current;
    if (!eq) return;
    try {
      audioEffectsService.connect(eq);
      audioEffectsService.applyBands(equalizerBands);
    } catch (e) {
      console.warn("[Kawaify] Web Audio connect failed:", e);
    }
  };

  const applyVolume = () => {
    const track = usePlayerStore.getState().currentTrack;
    if (track && isLocalTrack(track)) {
      const local = localAudioRef.current;
      if (local) {
        local.volume = clamp01(volume);
      }
      return;
    }
    const eq = eqAudioRef.current;
    if (eq) {
      eq.volume = clamp01(1);
    }
    audioEffectsService.setMasterGain(
      computeMasterGain(equalizerMasterGain, volume)
    );
  };

  const showAudiusUnavailableToast = (trackId: string) => {
    if (lastErrorToastTrackIdRef.current === trackId) return;
    lastErrorToastTrackIdRef.current = trackId;
    toast.error(AUDIUS_UNAVAILABLE_MSG);
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
    } else if (track) {
      showAudiusUnavailableToast(track.id);
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    lastErrorToastTrackIdRef.current = null;
  }, [currentTrack?.id]);

  useEffect(() => {
    if (!eqAudioRef.current) {
      eqAudioRef.current = new Audio();
    }
    if (!localAudioRef.current) {
      localAudioRef.current = new Audio();
    }
    if (!eqWiredRef.current && eqAudioRef.current) {
      eqWiredRef.current = true;
      connectEqEffects();
    }
    syncPublicRef();
    bumpAudioMount();
  }, []);

  useEffect(() => {
    syncPublicRef();
  }, [currentTrack?.id, currentTrack?.source]);

  useEffect(() => {
    if (!currentTrack || isLocalTrack(currentTrack)) return;
    connectEqEffects();
  }, [equalizerBands, currentTrack?.id, currentTrack?.source]);

  useEffect(() => {
    applyVolume();
    debugAudio({
      event: "volume",
      source: currentTrack?.source ?? null,
      volume,
      audioVolume: pickActive()?.volume,
      masterGain: computeMasterGain(equalizerMasterGain, volume),
    });
  }, [equalizerMasterGain, volume, currentTrack?.source]);

  useEffect(() => {
    const audio = pickActive();
    if (!audio || !currentTrack) return;

    const isLocal = isLocalTrack(currentTrack);

    if (isLocal && audioEffectsService.isConnectedTo(localAudioRef.current)) {
      audioEffectsService.disconnect();
      localAudioRef.current = new Audio();
      bumpAudioMount();
    }

    const active = isLocal ? localAudioRef.current : eqAudioRef.current;
    if (!active) return;

    const other = isLocal ? eqAudioRef.current : localAudioRef.current;
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
        if (!isLocal) connectEqEffects();
        applyVolume();
        syncPublicRef();
        if (usePlayerStore.getState().isPlaying && active.paused) {
          try {
            if (!isLocal) await audioEffectsService.resume();
            await active.play();
          } catch (err) {
            handlePlayFailure(err, currentTrack, active, playableSrc);
          }
        }
        debugAudio({
          event: "track-skip-reload",
          source: currentTrack.source,
          urlChanged: false,
          isPlaying: usePlayerStore.getState().isPlaying,
          volume,
          audioVolume: active.volume,
          masterGain: isLocal ? null : computeMasterGain(equalizerMasterGain, volume),
        });
        trackLoadingRef.current = false;
        return;
      }

      applyAudioCrossOrigin(active, playableSrc, currentTrack);
      active.muted = false;
      if (!isLocal) {
        connectEqEffects();
        await audioEffectsService.resume();
      }
      applyVolume();

      active.src = playableSrc;
      active.load();
      loadedTrackKeyRef.current = trackKey;
      syncPublicRef();

      debugAudio({
        event: "track-load",
        source: currentTrack.source,
        urlChanged: true,
        isPlaying: usePlayerStore.getState().isPlaying,
        volume,
        audioVolume: active.volume,
        masterGain: isLocal ? null : computeMasterGain(equalizerMasterGain, volume),
      });

      if (usePlayerStore.getState().isPlaying) {
        try {
          if (!isLocal) await audioEffectsService.resume();
          await active.play();
        } catch (err) {
          handlePlayFailure(err, currentTrack, active, playableSrc);
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

    const isLocal = isLocalTrack(currentTrack);
    const wasPlaying = prevIsPlayingRef.current;
    prevIsPlayingRef.current = isPlaying;

    if (wasPlaying === isPlaying) return;

    if (isPlaying) {
      if (trackLoadingRef.current || !audio.src) return;

      const play = async () => {
        if (!isLocal) {
          connectEqEffects();
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
      masterGain: computeMasterGain(equalizerMasterGain, volume),
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
        if (pickActive() !== audio) return;

        if (currentTrack && isLocalTrack(currentTrack)) {
          logLocalPlaybackDiagnostics(currentTrack, audio.src, audio);
          toast.error("Cannot play this local track. Audio URL is missing or unavailable.");
          setIsPlaying(false);
        } else if (currentTrack) {
          showAudiusUnavailableToast(currentTrack.id);
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
