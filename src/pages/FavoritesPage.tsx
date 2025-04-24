import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";
import { usePlayerStore } from "../store/playerStore";

const FavoritesPage = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<any[]>([]);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (!user) return;
    const fetchSongs = async () => {
      const loaded = await Promise.all(
        user.favorites.map(async (id) => {
          const snap = await getDoc(doc(db, "songs", id));
          return snap.exists() ? snap.data() : null;
        })
      );
      setSongs(loaded.filter(Boolean));
    };

    fetchSongs();
  }, [user]);

  const handlePlay = (song: any) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">♥ Favorite songs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {songs.map((song) => (
          <div key={song.id} className="bg-zinc-800 p-3 rounded-lg hover:bg-zinc-700 transition">
            <img src={song.image} alt={song.title} className="rounded mb-2 object-cover w-full h-40" />
            <div className="text-sm font-medium">{song.title}</div>
            <div className="text-xs text-zinc-400">{song.artists?.join(", ")}</div>
            <button
              onClick={() => handlePlay(song)}
              className="mt-2 text-pink-400 hover:underline text-xs"
            >
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
