import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Profile() {
  const { uid } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return;
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserData(snap.data());
        setEditName(snap.data().displayName || "");
      }
    };
    fetchData();
  }, [uid]);

  const handleUpdate = async () => {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    await updateDoc(ref, {
      displayName: editName,
      // avatar буде оновлений окремо після завантаження
    });
    alert("Оновлено!");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto bg-zinc-900 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Профіль</h1>
        
        {/* Аватарка */}
        <div className="mb-4">
          <img
            src={userData?.avatar || "https://via.placeholder.com/100"}
            alt="avatar"
            className="rounded-full w-24 h-24 object-cover"
          />
          <input
            type="file"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="mt-2"
          />
        </div>

        {/* Ім'я */}
        <label className="block mb-1">Ім'я</label>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700"
        />

        <button
          onClick={handleUpdate}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded w-full"
        >
          Зберегти
        </button>
      </div>
    </div>
  );
}
