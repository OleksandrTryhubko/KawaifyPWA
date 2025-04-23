import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
  
  export const saveAudiusTrack = async (track: any) => {
    const trackRef = doc(db, "songs", track.id);
    await setDoc(trackRef, {
      id: track.id,
      title: track.title,
      artist: track.user?.name || "Unknown",
      genre: track.genre || "unknown",
      duration: `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, "0")}`,
      image: track.artwork?.["320"] || "",
      streamUrl: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=kawaify`,
      source: "audius",
      addedAt: serverTimestamp()
    });
  };
  
  export const getTracksByGenre = async (genre: string) => {
    const q = query(collection(db, "songs"), where("genre", "==", genre));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data());
  };
  