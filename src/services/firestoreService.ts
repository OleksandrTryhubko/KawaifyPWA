/**
 * Firestore service layer — prepared for future migration to nested collections.
 * Current app still uses users.playlists[] array; these helpers document the target model.
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Playlist } from "../types/playlist";
import type { LocalTrackMetadata } from "../types/track";

export async function getUserDocument(userId: string): Promise<DocumentData | null> {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? snap.data() : null;
}

/** Future: users/{userId}/playlists/{playlistId} */
export async function saveUserPlaylistNested(
  userId: string,
  playlist: Playlist
): Promise<void> {
  await setDoc(doc(db, "users", userId, "playlists", playlist.id), {
    ...playlist,
    updatedAt: serverTimestamp(),
  });
}

/** Future: users/{userId}/localTracks/{trackId} */
export async function saveLocalTrackMetadata(
  userId: string,
  track: LocalTrackMetadata
): Promise<void> {
  await setDoc(doc(db, "users", userId, "localTracks", track.id), {
    ...track,
    userId,
    savedAt: serverTimestamp(),
  });
}

export async function getLocalTrackMetadata(
  userId: string,
  trackId: string
): Promise<LocalTrackMetadata | null> {
  const snap = await getDoc(doc(db, "users", userId, "localTracks", trackId));
  return snap.exists() ? (snap.data() as LocalTrackMetadata) : null;
}

export async function updateUserProfileFields(
  userId: string,
  fields: Partial<{ displayName: string; avatar: string }>
): Promise<void> {
  await updateDoc(doc(db, "users", userId), fields);
}
