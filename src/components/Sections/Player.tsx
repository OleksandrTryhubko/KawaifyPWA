import { usePlayerStore } from "../../store/playerStore";
import { useAudioEngine } from "../../hooks/useAudioEngine";
import { useListeningTracker } from "../../hooks/useListeningTracker";
import { useRecordRecentlyPlayed } from "../../hooks/useRecordRecentlyPlayed";
import { useLanguage } from "../../hooks/useLanguage";
import { CurrentSong } from "../Player/Song";
import PlayerControls from "../Player/PlayerControls";
import ProgressBar from "../Player/ProgressBar";
import VolumePanel from "../Player/VolumePanel";
import QueuePanel from "../Player/QueuePanel";
import EqualizerModal from "../../features/audio-tools/EqualizerModal";

const Player = () => {
  useListeningTracker();
  useRecordRecentlyPlayed();
  const { t } = useLanguage();
  const { audioRef } = useAudioEngine();

  const { currentTrack, togglePlayPause } = usePlayerStore((state) => ({
    currentTrack: state.currentTrack,
    togglePlayPause: state.togglePlayPause,
  }));

  const hasTrack = Boolean(currentTrack);

  return (
    <>
      <div className="player-shell w-full max-w-[100vw] overflow-hidden">
        {/* Mobile layout */}
        <div className="lg:hidden flex flex-col gap-1.5 px-2 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {hasTrack ? (
              <CurrentSong {...currentTrack!} compact />
            ) : (
              <div className="flex-1 h-10 flex items-center text-[11px] kawaify-text-muted px-1">
                {t("player.noTrack")}
              </div>
            )}
            <div className="shrink-0 w-[100px] sm:w-[120px]">
              <VolumePanel compact />
            </div>
          </div>

          {hasTrack && <ProgressBar audio={audioRef} />}

          <PlayerControls
            onTogglePlay={togglePlayPause}
            disabled={!hasTrack}
            compact
          />
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex flex-col gap-2 px-4 py-2">
          {hasTrack && <ProgressBar audio={audioRef} />}

          <div className="player-desktop-grid">
            <div className="player-left min-w-0">
              {hasTrack ? (
                <CurrentSong {...currentTrack!} large />
              ) : (
                <div className="h-16 flex items-center text-xs kawaify-text-muted">
                  {t("player.noTrack")}
                </div>
              )}
            </div>

            <div className="player-center">
              <PlayerControls
                onTogglePlay={togglePlayPause}
                disabled={!hasTrack}
              />
            </div>

            <div className="player-right flex items-center justify-end min-w-0">
              <VolumePanel />
            </div>
          </div>
        </div>
      </div>

      <QueuePanel />
      <EqualizerModal />
    </>
  );
};

export default Player;
