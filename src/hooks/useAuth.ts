import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { UserProfile } from "../types/user";
import type { Playlist } from "../types/playlist";

export type { UserProfile };

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: data.displayName || "",
            avatar: data.avatarUrl || data.photoURL || data.avatar || "",
            favorites: data.favorites || [],
            playlists: (data.playlists || []) as Playlist[],
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: data.displayName || "",
        avatar: data.avatarUrl || data.photoURL || data.avatar || "",
        favorites: data.favorites || [],
        playlists: (data.playlists || []) as Playlist[],
      });
    }
  };

  return { user, loading, logout, refreshUser };
};
