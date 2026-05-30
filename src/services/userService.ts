import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Playlist } from "../types/playlist";
import { DEFAULT_USER_STATS } from "../utils/userStats";
import { cleanPlaylistForFirestore } from "../utils/firestoreClean";

export const createUser = async (email: string, uid: string) => {
  await setDoc(doc(db, "users", uid), {
    email,
    displayName: "",
    avatar: "",
    favorites: [],
    playlists: [],
    stats: { ...DEFAULT_USER_STATS },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export async function incrementListeningStats(
  userId: string,
  seconds: number,
  trackStarted = false
): Promise<void> {
  if (!userId) return;

  const roundedSeconds = Math.max(0, Math.floor(seconds));
  if (roundedSeconds === 0 && !trackStarted) return;

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  if (!data?.stats) {
    await updateDoc(userRef, {
      stats: {
        listeningSeconds: roundedSeconds,
        tracksPlayed: trackStarted ? 1 : 0,
      },
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(userRef, {
    ...(roundedSeconds > 0
      ? { "stats.listeningSeconds": increment(roundedSeconds) }
      : {}),
    ...(trackStarted ? { "stats.tracksPlayed": increment(1) } : {}),
    updatedAt: serverTimestamp(),
  });
}

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

export const updateUserPlaylists = async (
  userId: string,
  playlists: Playlist[]
): Promise<void> => {
  const cleaned = playlists.map((p) => cleanPlaylistForFirestore(p));
  await updateDoc(doc(db, "users", userId), {
    playlists: cleaned,
    updatedAt: serverTimestamp(),
  });
};

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

    const cleaned = cleanPlaylistForFirestore(playlist);
    await updateDoc(userRef, {
      playlists: [...playlists.map((p) => cleanPlaylistForFirestore(p)), cleaned],
      updatedAt: serverTimestamp(),
    });
    return "created";
  } catch (error) {
    console.error("[Kawaify playlist]", error);
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
        ? cleanPlaylistForFirestore({
            ...playlist,
            trackIds: [...playlist.trackIds, trackId],
          })
        : cleanPlaylistForFirestore(playlist)
    );

    await updateDoc(userRef, { playlists: updatedPlaylists });
    return "added";
  } catch (error) {
    console.error("[Kawaify playlist]", error);
    return "error";
  }
};
