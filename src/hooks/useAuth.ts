import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { UserProfile } from "../types/user";
import type { Playlist } from "../types/playlist";
import { parseUserStats } from "../utils/userStats";

export type { UserProfile };

function mapFirestoreUser(
  uid: string,
  email: string,
  data: Record<string, unknown>
): UserProfile {
  return {
    uid,
    email,
    displayName: String(data.displayName || ""),
    avatar: String(data.avatarUrl || data.photoURL || data.avatar || ""),
    favorites: (data.favorites as string[]) || [],
    playlists: (data.playlists || []) as Playlist[],
    stats: parseUserStats(data),
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(
            mapFirestoreUser(
              firebaseUser.uid,
              firebaseUser.email || "",
              userSnap.data() as Record<string, unknown>
            )
          );
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
      setUser(
        mapFirestoreUser(
          firebaseUser.uid,
          firebaseUser.email || "",
          userSnap.data() as Record<string, unknown>
        )
      );
    }
  };

  return { user, loading, logout, refreshUser };
};
