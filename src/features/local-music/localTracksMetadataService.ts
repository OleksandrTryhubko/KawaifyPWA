import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { LocalTrackMetadataDoc } from "./types";

function localTrackDocRef(userId: string, trackId: string) {
  return doc(db, "users", userId, "localTracks", trackId);
}

export async function saveLocalTrackMetadata(
  userId: string,
  track: LocalTrackMetadataDoc
): Promise<void> {
  await setDoc(localTrackDocRef(userId, track.id), {
    ...track,
    updatedAt: serverTimestamp(),
    createdAt: track.createdAt ?? serverTimestamp(),
  });
}

/**
 * Prepared for future flow where file upload happens separately.
 * For now, this only saves metadata (including expected Storage path).
 */
export async function uploadLocalTrackMetadata(
  userId: string,
  track: Omit<LocalTrackMetadataDoc, "createdAt" | "updatedAt">
): Promise<void> {
  await saveLocalTrackMetadata(userId, track);
}

export async function getUserLocalTracks(
  userId: string
): Promise<LocalTrackMetadataDoc[]> {
  const q = query(
    collection(db, "users", userId, "localTracks"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LocalTrackMetadataDoc);
}

export async function deleteLocalTrackMetadata(
  userId: string,
  trackId: string
): Promise<void> {
  await deleteDoc(localTrackDocRef(userId, trackId));
}

