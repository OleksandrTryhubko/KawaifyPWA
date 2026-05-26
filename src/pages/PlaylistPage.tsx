import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { usePlayerStore } from "../store/playerStore";
import { useToast } from "../hooks/useToast";
import type { Playlist } from "../types/playlist";
import type { Track } from "../types/track";
import TrackArtwork from "../components/common/TrackArtwork";

const PlaylistPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Track[]>([]);
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (!user || !id) return;

    const foundPlaylist = user.playlists.find((p) => p.id === id);
    setPlaylist(foundPlaylist ?? null);

    const fetchTracks = async () => {
      if (!foundPlaylist?.trackIds?.length) {
        setSongs([]);
        return;
      }

      const loadedSongs = await Promise.all(
        foundPlaylist.trackIds.map(async (trackId) => {
          const trackSnap = await getDoc(doc(db, "songs", trackId));
          return trackSnap.exists() ? (trackSnap.data() as Track) : null;
        })
      );

      setSongs(loadedSongs.filter((s): s is Track => s !== null));
    };

    fetchTracks();
  }, [user, id]);

  const handlePlay = (song: Track) => {
    setCurrentTrack(song);
    setIsPlaying(true);
  };

  const handleRemoveTrack = async (trackId: string) => {
    if (!user || !playlist) return;

    const updatedPlaylists = user.playlists.map((p) =>
      p.id === playlist.id
        ? { ...p, trackIds: p.trackIds.filter((tid) => tid !== trackId) }
        : p
    );

    await updateDoc(doc(db, "users", user.uid), {
      playlists: updatedPlaylists,
    });

    setPlaylist((prev) =>
      prev
        ? { ...prev, trackIds: prev.trackIds.filter((tid) => tid !== trackId) }
        : null
    );

    setSongs((prev) => prev.filter((s) => s.id !== trackId));
    toast.info("Трек видалено з плейлиста");
  };

  const handleDeletePlaylist = async () => {
    if (!user || !playlist) return;

    const updatedPlaylists = user.playlists.filter((p) => p.id !== playlist.id);

    await updateDoc(doc(db, "users", user.uid), {
      playlists: updatedPlaylists,
    });

    toast.success("Плейлист видалено");
    navigate("/");
  };

  if (!playlist) {
    return (
      <div className="p-6 text-white">
        <p className="text-lg">Playlist not found or not owned by you 😢</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-28 h-28 shrink-0">
          <TrackArtwork
            src={playlist.image}
            alt={playlist.title}
            className="!aspect-auto w-28 h-28 rounded shadow"
          />
        </div>
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
            <TrackArtwork
              src={song.image}
              alt={song.title}
              className="mb-2 h-40 !aspect-auto"
            />
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">{song.title}</div>
                <div className="text-xs text-zinc-400">
                  {song.artists?.join(", ")}
                </div>
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
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPage;
