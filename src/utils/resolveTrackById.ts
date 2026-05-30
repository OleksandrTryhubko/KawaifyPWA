import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Track } from "../types/track";
import type { LocalTrackMetadataDoc } from "../features/local-music/types";
import { toPlayableLocalTrack } from "../features/local-music/LocalTrackCard";

const DEV = import.meta.env.DEV;

/**
 * Resolve a track ID to playable metadata.
 * Audius/songs first, then users/{uid}/localTracks/{id}.
 */
export async function resolveTrackById(
  userId: string,
  trackId: string
): Promise<Track | null> {
  const songSnap = await getDoc(doc(db, "songs", trackId));
  if (songSnap.exists()) {
    const data = songSnap.data() as Track;
    return { ...data, source: data.source || "audius" };
  }

  const localSnap = await getDoc(doc(db, "users", userId, "localTracks", trackId));
  if (localSnap.exists()) {
    return toPlayableLocalTrack(localSnap.data() as LocalTrackMetadataDoc);
  }

  if (DEV) {
    console.warn(
      "[Kawaify resolveTrack] missing track metadata:",
      trackId,
      "(checked songs/ and users/localTracks/)"
    );
  }
  return null;
}

export async function resolveTracksByIds(
  userId: string,
  trackIds: string[]
): Promise<Track[]> {
  const loaded = await Promise.all(
    trackIds.map((id) => resolveTrackById(userId, id))
  );
  return loaded.filter((t): t is Track => t !== null);
}
