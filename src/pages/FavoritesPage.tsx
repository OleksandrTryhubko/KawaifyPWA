import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";
import { usePlayerStore } from "../store/playerStore";
import type { Track } from "../types/track";
import TrackCard from "../components/common/TrackCard";

const FavoritesPage = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Track[]>([]);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (!user) return;
    const fetchSongs = async () => {
      const loaded = await Promise.all(
        user.favorites.map(async (id) => {
          const snap = await getDoc(doc(db, "songs", id));
          return snap.exists() ? (snap.data() as Track) : null;
        })
      );
      setSongs(loaded.filter((s): s is Track => s !== null));
    };

    fetchSongs();
  }, [user]);

  const handlePlay = (song: Track) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  return (
    <div className="kawaify-page kawaify-text overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">♥ Favorite songs</h1>

      {songs.length === 0 ? (
        <div className="kawaify-card p-6 text-center kawaify-text-muted">
          У обраному поки немає треків
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <TrackCard
              key={song.id}
              title={song.title}
              artist={song.artists?.join(", ")}
              image={song.image}
              onPlay={() => handlePlay(song)}
              showPlayButton
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
