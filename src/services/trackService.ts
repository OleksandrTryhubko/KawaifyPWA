import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { AudiusTrack } from "../types/audius";
import {
  formatAudiusDuration,
  getAudiusArtworkUrl,
  getAudiusStreamUrl,
} from "../api/audius";
import type { Track } from "../types/track";

export const saveAudiusTrack = async (track: AudiusTrack) => {
  const trackRef = doc(db, "songs", track.id);
  await setDoc(trackRef, {
    id: track.id,
    title: track.title,
    artists: [track.user?.name || "Unknown"],
    genre: track.genre || "unknown",
    duration: formatAudiusDuration(track.duration),
    image: getAudiusArtworkUrl(track.artwork),
    streamUrl: getAudiusStreamUrl(track.id),
    source: "audius",
    addedAt: serverTimestamp(),
  });
};

export const getTracksByGenre = async (genre: string): Promise<Track[]> => {
  const q = query(collection(db, "songs"), where("genre", "==", genre));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Track);
};
