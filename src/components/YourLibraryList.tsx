import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import type { Playlist } from "../types/playlist";
import TrackArtwork from "./common/TrackArtwork";

const YourLibraryList = () => {
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

  return (
    <>
      {favorites.length > 0 && (
        <li>
          <Link
            to="/favorites"
            className="flex items-center gap-2 text-zinc-300 hover:text-white text-sm px-5 py-2"
          >
            <img
              src="/favicon.ico"
              alt="Favorites"
              className="w-8 h-8 object-cover rounded"
            />
            ♥ Favorites
          </Link>
        </li>
      )}

      {playlists.map((playlist) => (
        <li key={playlist.id}>
          <Link
            to={`/playlist/${playlist.id}`}
            className="flex items-center gap-2 text-zinc-300 hover:text-white text-sm px-5 py-2"
          >
            <div className="w-8 h-8 shrink-0">
              <TrackArtwork
                src={playlist.image}
                alt={playlist.title}
                className="!aspect-auto w-8 h-8 rounded"
                size="sm"
              />
            </div>
            {playlist.title}
          </Link>
        </li>
      ))}
    </>
  );
};

export default YourLibraryList;
