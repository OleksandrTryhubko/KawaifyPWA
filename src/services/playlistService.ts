import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export const createPlaylist = async (playlistId: string, userId: string, name: string, coverImage: string) => {
  await setDoc(doc(db, "playlists", playlistId), {
    title: name,
    ownerId: userId,
    image: coverImage,
    trackIds: [],
    createdAt: serverTimestamp()
  });
};

export const addTrackToPlaylist = async (playlistId: string, trackId: string) => {
  await updateDoc(doc(db, "playlists", playlistId), {
    trackIds: arrayUnion(trackId)
  });
};
