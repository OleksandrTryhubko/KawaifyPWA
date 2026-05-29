import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebase";

const MAX_COVER_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "cover";
}

export async function uploadPlaylistCover(
  userId: string,
  playlistId: string,
  file: File,
  existingCoverPath?: string
): Promise<{ coverUrl: string; coverPath: string }> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Підтримуються PNG, JPG або WEBP");
  }
  if (file.size > MAX_COVER_BYTES) {
    throw new Error("Обкладинка завелика (макс. 2 MB)");
  }

  if (existingCoverPath) {
    try {
      await deleteObject(ref(storage, existingCoverPath));
    } catch {
      // ignore
    }
  }

  const coverPath = `users/${userId}/playlist-covers/${playlistId}/${safeName(file.name)}`;
  await uploadBytes(ref(storage, coverPath), file, {
    contentType: file.type,
    cacheControl: "public,max-age=3600",
  });
  const coverUrl = await getDownloadURL(ref(storage, coverPath));
  return { coverUrl, coverPath };
}
