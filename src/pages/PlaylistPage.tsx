import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { usePlayerStore } from "../store/playerStore";

const PlaylistPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (!user || !id) return;

    const foundPlaylist = user.playlists.find((p: any) => p.id === id);
    setPlaylist(foundPlaylist);

    const fetchTracks = async () => {
      if (!foundPlaylist?.trackIds?.length) return;

      const loadedSongs = await Promise.all(
        foundPlaylist.trackIds.map(async (trackId: string) => {
          const trackSnap = await getDoc(doc(db, "songs", trackId));
          return trackSnap.exists() ? trackSnap.data() : null;
        })
      );

      setSongs(loadedSongs.filter(Boolean));
    };

    fetchTracks();
  }, [user, id]);

  const handlePlay = (song: any) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!user || !playlist) return;

    const updatedPlaylists = user.playlists.map((p: any) =>
      p.id === playlist.id
        ? { ...p, trackIds: p.trackIds.filter((id: string) => id !== trackId) }
        : p
    );

    await updateDoc(doc(db, "users", user.uid), {
      playlists: updatedPlaylists,
    });

    setPlaylist((prev: any) => ({
      ...prev,
      trackIds: prev.trackIds.filter((id: string) => id !== trackId),
    }));

    setSongs((prev) => prev.filter((s) => s.id !== trackId));
  };

  const handleDeletePlaylist = async () => {
    if (!user || !playlist) return;

    const updatedPlaylists = user.playlists.filter((p: any) => p.id !== playlist.id);

    await updateDoc(doc(db, "users", user.uid), {
      playlists: updatedPlaylists,
    });

    alert("Плейлист видалено!");
    navigate("/");
  };

  if (!playlist) {
    return (
      <div className="p-6 text-white">
        <p className="text-lg">Плейлист не знайдено або не належить вам 😢</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={playlist.image || "/fallback.jpg"}
          alt={playlist.title}
          className="w-28 h-28 object-cover rounded shadow"
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">{playlist.title}</h1>
          <p className="text-sm text-zinc-400">{songs.length} трек(ів)</p>
          <button
            onClick={handleDeletePlaylist}
            className="text-red-400 hover:underline text-sm"
          >
            🗑 Видалити плейлист
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {songs.map((song) => (
          <div
            key={song.id}
            className="bg-zinc-800 p-3 rounded-lg hover:bg-zinc-700 transition"
          >
            <img
              src={song.image}
              alt={song.title}
              className="rounded mb-2 object-cover w-full h-40"
            />
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">{song.title}</div>
                <div className="text-xs text-zinc-400">{song.artists?.join(", ")}</div>
              </div>
              <button
                onClick={() => handleRemoveTrack(song.id)}
                className="text-xs text-red-400 hover:underline ml-2"
              >
                🗑
              </button>
            </div>

            <button
              onClick={() => handlePlay(song)}
              className="mt-2 text-pink-400 hover:underline text-xs"
            >
              ▶ Відтворити
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
