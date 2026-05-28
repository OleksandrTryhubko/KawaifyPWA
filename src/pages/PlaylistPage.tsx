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
import TrackCard from "../components/common/TrackCard";
import Button from "../components/ui/Button";

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
      <div className="kawaify-page kawaify-text">
        <p className="text-lg">Playlist not found or not owned by you 😢</p>
      </div>
    );
  }

  return (
    <div className="kawaify-page kawaify-text overflow-x-hidden">
      <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="w-28 h-28 shrink-0 overflow-hidden rounded-xl shadow-md">
          <TrackArtwork
            src={playlist.image}
            alt={playlist.title}
            className="!aspect-square w-full h-full"
          />
        </div>
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{playlist.title}</h1>
          <p className="text-sm kawaify-text-muted">{songs.length} трек(ів)</p>
          <Button type="button" variant="danger" size="sm" onClick={handleDeletePlaylist}>
            🗑 Видалити плейлист
          </Button>
        </div>
      </header>

      {songs.length === 0 ? (
        <div className="kawaify-card p-6 text-center kawaify-text-muted">
          У цьому плейлисті поки немає треків
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
              onRemove={() => handleRemoveTrack(song.id)}
              showPlayButton
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistPage;
