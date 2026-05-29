import { usePlayerStore } from "../../store/playerStore";
import { useAudioEngine } from "../../hooks/useAudioEngine";
import { useListeningTracker } from "../../hooks/useListeningTracker";
import { useRecordRecentlyPlayed } from "../../hooks/useRecordRecentlyPlayed";
import { CurrentSong } from "../Player/Song";
import PlayerControls from "../Player/PlayerControls";
import ProgressBar from "../Player/ProgressBar";
import VolumePanel from "../Player/VolumePanel";
import AbRepeatControl from "../Player/AbRepeatControl";
import QueuePanel from "../Player/QueuePanel";
import EqualizerModal from "../../features/audio-tools/EqualizerModal";
import FavoriteButton from "../Player/FavoriteButton";
import AddToPlaylistButton from "../Player/AddToPlaylistButton";

const Player = () => {
  useListeningTracker();
  useRecordRecentlyPlayed();

  const { audioRef } = useAudioEngine();

  const { currentTrack, togglePlayPause } = usePlayerStore((state) => ({
    currentTrack: state.currentTrack,
    togglePlayPause: state.togglePlayPause,
  }));

  const hasTrack = Boolean(currentTrack);

  return (
    <>
      <div className="player-shell flex flex-col w-full max-w-[100vw] px-2 sm:px-4 py-2 gap-2">
        {hasTrack && (
          <div className="w-full px-1">
            <ProgressBar audio={audioRef} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-4">
          {/* Left: artwork + meta */}
          <div className="flex items-center gap-3 min-w-0 lg:w-[28%] lg:max-w-[320px] shrink-0 order-1">
            {hasTrack ? (
              <CurrentSong {...currentTrack!} large />
            ) : (
              <div className="h-14 flex items-center text-xs kawaify-text-muted px-1">
                Оберіть трек для відтворення
              </div>
            )}
          </div>

          {/* Center: controls */}
          <div className="flex flex-col items-center flex-1 gap-1.5 min-w-0 order-3 lg:order-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <FavoriteButton />
              <PlayerControls
                onTogglePlay={togglePlayPause}
                disabled={!hasTrack}
              />
              <AddToPlaylistButton />
            </div>
            {hasTrack && (
              <div className="hidden sm:flex">
                <AbRepeatControl audio={audioRef} />
              </div>
            )}
          </div>

          {/* Right: volume */}
          <div className="flex items-center justify-end lg:w-[22%] order-2 lg:order-3 shrink-0">
            <VolumePanel />
          </div>
        </div>
      </div>

      <QueuePanel />
      <EqualizerModal />
    </>
  );
};

export default Player;
