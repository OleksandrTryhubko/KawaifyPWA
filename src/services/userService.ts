import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

// 🔹 Створення користувача
export const createUser = async (email: string, uid: string) => {
  await setDoc(doc(db, "users", uid), {
    email,
    displayName: "",
    avatar: "",
    favorites: [],
    playlists: [],
    createdAt: serverTimestamp(),
  });
};

// 🔹 Додати або видалити трек з улюблених
export const toggleFavoriteTrack = async (userId: string, trackId: string) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return;

  const data = snap.data();
  const favorites: string[] = data.favorites || [];

  const updatedFavorites = favorites.includes(trackId)
    ? favorites.filter((id) => id !== trackId)
    : [...favorites, trackId];

  await updateDoc(userRef, { favorites: updatedFavorites });
};

// 🔹 Створення плейлиста
interface NewPlaylist {
  id: string;
  title: string;
  image?: string;
  createdAt: any;
  trackIds: string[];
}

export const addUserPlaylist = async (userId: string, playlist: NewPlaylist) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  const playlists: NewPlaylist[] = snap.data()?.playlists || [];

  await updateDoc(userRef, {
    playlists: [...playlists, playlist],
  });
};

// 🔹 Додати трек до конкретного плейлиста
export const addTrackToUserPlaylist = async (
  userId: string,
  playlistId: string,
  trackId: string
) => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  const playlists = snap.data()?.playlists || [];

  const updatedPlaylists = playlists.map((playlist: NewPlaylist) =>
    playlist.id === playlistId
      ? {
          ...playlist,
          trackIds: playlist.trackIds.includes(trackId)
            ? playlist.trackIds
            : [...playlist.trackIds, trackId],
        }
      : playlist
  );

  await updateDoc(userRef, { playlists: updatedPlaylists });
};
