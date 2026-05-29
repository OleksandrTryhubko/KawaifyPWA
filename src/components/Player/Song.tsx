import TrackArtwork from "../common/TrackArtwork";

interface CurrentSongProps {
  image: string;
  title: string;
  artists: string[];
  large?: boolean;
}

export const CurrentSong = ({ image, title, artists, large }: CurrentSongProps) => {
  const size = large ? "w-14 h-14 sm:w-20 sm:h-20" : "w-12 h-12 sm:w-16 sm:h-16";
  return (
    <div className="flex items-center gap-3 sm:gap-4 relative overflow-hidden min-w-0">
      <div className={`${size} shrink-0 rounded-lg overflow-hidden shadow-lg ring-1 ring-pink-500/20`}>
        <TrackArtwork
          src={image}
          alt={title}
          className={`!aspect-auto ${size} rounded-lg animate-artwork-in`}
          size={large ? "md" : "sm"}
        />
      </div>

      <div className="flex flex-col min-w-0">
        <h3 className={`font-semibold truncate ${large ? "text-sm sm:text-base" : "text-sm"}`}>
          {title}
        </h3>
        <span className="text-xs kawaify-text-muted truncate">{artists?.join(", ")}</span>
      </div>
    </div>
  );
};
