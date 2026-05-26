import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Playlist } from "../types/playlist";

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

export type FavoriteToggleResult = "added" | "removed" | "unchanged";

export const toggleFavoriteTrack = async (
  userId: string,
  trackId: string
): Promise<FavoriteToggleResult> => {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return "unchanged";

  const data = snap.data();
  const favorites: string[] = data.favorites || [];

  if (favorites.includes(trackId)) {
    const updatedFavorites = favorites.filter((id) => id !== trackId);
    await updateDoc(userRef, { favorites: updatedFavorites });
    return "removed";
  }

  await updateDoc(userRef, { favorites: [...favorites, trackId] });
  return "added";
};

export type AddPlaylistResult = "created" | "duplicate_name" | "error";

export const addUserPlaylist = async (
  userId: string,
  playlist: Playlist
): Promise<AddPlaylistResult> => {
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const playlists: Playlist[] = snap.data()?.playlists || [];

    const normalized = playlist.title.trim().toLowerCase();
    const duplicate = playlists.some(
      (p) => p.title.trim().toLowerCase() === normalized
    );
    if (duplicate) return "duplicate_name";

    await updateDoc(userRef, {
      playlists: [...playlists, playlist],
    });
    return "created";
  } catch {
    return "error";
  }
};

export type AddTrackToPlaylistResult =
  | "added"
  | "already_in_playlist"
  | "playlist_not_found"
  | "error";

export const addTrackToUserPlaylist = async (
  userId: string,
  playlistId: string,
  trackId: string
): Promise<AddTrackToPlaylistResult> => {
  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    const playlists: Playlist[] = snap.data()?.playlists || [];

    const target = playlists.find((p) => p.id === playlistId);
    if (!target) return "playlist_not_found";

    if (target.trackIds.includes(trackId)) {
      return "already_in_playlist";
    }

    const updatedPlaylists = playlists.map((playlist) =>
      playlist.id === playlistId
        ? { ...playlist, trackIds: [...playlist.trackIds, trackId] }
        : playlist
    );

    await updateDoc(userRef, { playlists: updatedPlaylists });
    return "added";
  } catch {
    return "error";
  }
};
