import { IoTimeOutline } from "react-icons/io5";
import { Song } from "../lib/types";

interface MusicsTableProps {
  songs: Song[];
}

const MusicsTable = ({ songs }: MusicsTableProps) => {
  return (
    <div className="flex flex-col gap-2">
      {songs.map((song, index) => (
        <div
          key={song?.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 transition"
        >
          {/* Index + Cover + Title */}
          <div className="flex items-center gap-4 flex-1">
            <span className="text-zinc-400 text-sm w-6 text-center">
              {index + 1}
            </span>

            <img
              src={song.image}
              alt={song.title}
              className="w-12 h-12 object-cover rounded-md"
            />

            <div className="flex flex-col">
              <h3 className="text-white text-base font-medium">{song.title}</h3>
              <span className="text-sm text-zinc-400">
                {song.artists.join(", ")}
              </span>
            </div>
          </div>

          {/* Album */}
          <div className="text-zinc-300 text-sm flex-1 hidden sm:block">
            {song.album}
          </div>

          {/* Duration */}
          <div className="text-zinc-400 text-sm flex items-center gap-1 sm:justify-end">
            <IoTimeOutline />
            <span>{song.duration}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MusicsTable;
