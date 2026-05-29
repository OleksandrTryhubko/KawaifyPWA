import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Playlist } from "../types/playlist";
import TrackArtwork from "./common/TrackArtwork";

interface YourLibraryListProps {
  onNavigate?: () => void;
}

const YourLibraryList = ({ onNavigate }: YourLibraryListProps) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setFavorites(data.favorites || []);
      setPlaylists(data.playlists || []);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  if (!user) return null;

  const linkClass =
    "flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm px-4 py-2 rounded-lg hover:bg-[var(--surface-soft)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50";

  return (
    <>
      <li>
        <Link to="/my-music" className={linkClass} onClick={onNavigate}>
          <div className="w-8 h-8 shrink-0 rounded bg-gradient-to-br from-pink-500/30 to-purple-500/20 flex items-center justify-center text-sm">
            ♪
          </div>
          <span className="truncate">My Music</span>
        </Link>
      </li>

      {favorites.length > 0 && (
        <li>
          <Link to="/favorites" className={linkClass} onClick={onNavigate}>
            <img
              src="/favicon.ico"
              alt="Favorites"
              className="w-8 h-8 object-cover rounded shrink-0"
            />
            <span className="truncate">♥ Favorites</span>
          </Link>
        </li>
      )}

      {playlists.map((playlist) => (
        <li key={playlist.id}>
          <Link
            to={`/playlist/${playlist.id}`}
            className={linkClass}
            onClick={onNavigate}
          >
            <div className="w-8 h-8 shrink-0 overflow-hidden rounded">
              <TrackArtwork
                src={playlist.coverUrl || playlist.image}
                alt={playlist.title}
                className="!aspect-square w-8 h-8"
                size="sm"
              />
            </div>
            <span className="truncate">{playlist.title}</span>
          </Link>
        </li>
      ))}
    </>
  );
};

export default YourLibraryList;
