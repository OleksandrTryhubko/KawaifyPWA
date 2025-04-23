import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export const createUser = async (email: string, uid: string) => {
  await setDoc(doc(db, "users", uid), {
    email,
    displayName: "",
    avatar: "",
    favorites: [],
    playlists: [],
    createdAt: serverTimestamp()
  });
};

export const addFavoriteTrack = async (userId: string, trackId: string) => {
  await updateDoc(doc(db, "users", userId), {
    favorites: arrayUnion(trackId)
  });
};

export const addUserPlaylist = async (userId: string, playlistId: string) => {
  await updateDoc(doc(db, "users", userId), {
    playlists: arrayUnion(playlistId)
  });
};
