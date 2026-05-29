import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Track } from "../types/track";

export interface RecentlyPlayedItem {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  artwork: string;
  source: "audius" | "local";
  playedAt: unknown;
  duration: string;
  streamUrl: string;
}

const LOCAL_KEY_PREFIX = "kawaify_recent_";
const MAX_ITEMS = 20;

function localKey(userId: string) {
  return `${LOCAL_KEY_PREFIX}${userId}`;
}

function trackToRecent(track: Track): Omit<RecentlyPlayedItem, "playedAt"> {
  return {
    id: track.id,
    trackId: track.id,
    title: track.title,
    artist: track.artists?.join(", ") || "Unknown",
    artwork: track.image || "",
    source: track.source === "local" ? "local" : "audius",
    duration: track.duration || "0:00",
    streamUrl: track.streamUrl,
  };
}

function readLocal(userId: string): RecentlyPlayedItem[] {
  try {
    const raw = localStorage.getItem(localKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentlyPlayedItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(userId: string, items: RecentlyPlayedItem[]) {
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // ignore quota errors
  }
}

export function clearRecentlyPlayedLocal(userId: string) {
  localStorage.removeItem(localKey(userId));
}

export async function recordRecentlyPlayed(
  userId: string,
  track: Track
): Promise<void> {
  if (!userId || !track?.id) return;

  const payload: RecentlyPlayedItem = {
    ...trackToRecent(track),
    playedAt: Date.now(),
  };

  const localItems = readLocal(userId).filter((i) => i.trackId !== track.id);
  writeLocal(userId, [payload, ...localItems]);

  try {
    await setDoc(
      doc(db, "users", userId, "recentlyPlayed", track.id),
      {
        ...payload,
        playedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Firestore rules may block — local cache still works
  }
}

export async function getRecentlyPlayed(
  userId: string,
  max = 10
): Promise<RecentlyPlayedItem[]> {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, "users", userId, "recentlyPlayed"),
      orderBy("playedAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as RecentlyPlayedItem);
    }
  } catch {
    // fallback to local
  }

  return readLocal(userId).slice(0, max);
}

export function recentlyPlayedToTrack(item: RecentlyPlayedItem): Track {
  return {
    id: item.trackId,
    title: item.title,
    artists: [item.artist],
    duration: item.duration,
    image: item.artwork,
    streamUrl: item.streamUrl,
    source: item.source,
  };
}
