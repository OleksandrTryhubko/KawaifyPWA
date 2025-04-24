import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { addTrackToUserPlaylist, addUserPlaylist } from "../../services/userService";
import { usePlayerStore } from "../../store/playerStore";

interface PlaylistModalProps {
  open: boolean;
  onClose: () => void;
}

const PlaylistModal = ({ open, onClose }: PlaylistModalProps) => {
  const { user } = useAuth();
  const { currentTrack } = usePlayerStore();
  const [newTitle, setNewTitle] = useState("");
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    if (user) setPlaylists(user.playlists || []);
  }, [user]);

  const handleAdd = async (id: string) => {
    if (user && currentTrack) {
      await addTrackToUserPlaylist(user.uid, id, currentTrack.id);
      onClose();
    }
  };

  const handleCreate = async () => {
    if (!newTitle || !user) return;
    const newPlaylist = {
      id: Date.now().toString(),
      title: newTitle,
      createdAt: new Date(),
      image: currentTrack?.image ?? "",
      trackIds: currentTrack ? [currentTrack.id] : [],
    };
    await addUserPlaylist(user.uid, newPlaylist);
    setNewTitle("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
      <div className="bg-zinc-900 p-4 rounded-lg w-full max-w-sm">
        <h2 className="text-white text-lg mb-3">Додати до плейлисту</h2>
        <ul className="space-y-2">
          {playlists.map((pl) => (
            <li
              key={pl.id}
              className="text-white hover:bg-zinc-800 p-2 rounded cursor-pointer"
              onClick={() => handleAdd(pl.id)}
            >
              {pl.title}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Новий плейлист"
            className="w-full p-2 rounded bg-zinc-800 text-white mb-2"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            onClick={handleCreate}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded p-2"
          >
            Створити і додати
          </button>
        </div>

        <button onClick={onClose} className="absolute top-2 right-3 text-white text-xl">×</button>
      </div>
    </div>
  );
};

export default PlaylistModal;