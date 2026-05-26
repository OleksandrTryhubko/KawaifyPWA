import { updateUserProfileFields } from "../../services/firestoreService";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../lib/firebase";

/** Placeholder — full account CRUD coming later */
export async function updateDisplayName(
  userId: string,
  displayName: string
): Promise<void> {
  await updateUserProfileFields(userId, { displayName });
}

export interface UploadAvatarResult {
  downloadUrl: string;
  storagePath: string;
}

function getAvatarExtension(mimeType: string, fileName: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName === "png" || fromName === "jpg" || fromName === "jpeg" || fromName === "webp") {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "png";
}

export async function uploadUserAvatar(
  userId: string,
  file: File
): Promise<UploadAvatarResult> {
  const ext = getAvatarExtension(file.type, file.name);
  const storagePath = `users/${userId}/avatar/avatar.${ext}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type || "image/png",
    cacheControl: "public,max-age=3600",
  });

  const downloadUrl = await getDownloadURL(storageRef);

  await updateDoc(doc(db, "users", userId), {
    avatarUrl: downloadUrl,
    // keep backward compatibility with old field name if something uses it
    avatar: downloadUrl,
    updatedAt: serverTimestamp(),
  });

  return { downloadUrl, storagePath };
}
