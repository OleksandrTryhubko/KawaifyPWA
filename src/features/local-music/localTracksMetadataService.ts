import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import {
  MAX_LOCAL_COVER_SIZE_BYTES,
  MAX_LOCAL_TRACK_FILE_SIZE_BYTES,
  MAX_LOCAL_TRACKS_TOTAL_BYTES,
  SUPPORTED_AUDIO_MIME_TYPES,
  SUPPORTED_COVER_MIME_TYPES,
  type LocalTrackMetadataDoc,
} from "./types";

function localTrackDocRef(userId: string, trackId: string) {
  return doc(db, "users", userId, "localTracks", trackId);
}

function toSafeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "audio-file";
}

function createTrackId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").trim() || "Local Track";
}

function toUploadError(error: unknown): Error {
  if (error instanceof Error && error.message && !("code" in error)) {
    return error;
  }

  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";

  if (
    code.includes("storage/unauthorized") ||
    code.includes("storage/unauthenticated") ||
    code.includes("permission-denied")
  ) {
    return new Error(
      "Немає доступу до Firebase Storage. Перевірте правила безпеки."
    );
  }

  if (code.includes("storage/quota-exceeded") || code.includes("resource-exhausted")) {
    return new Error("Перевищено ліміт сховища Firebase.");
  }

  if (code.includes("storage/canceled")) {
    return new Error("Завантаження скасовано.");
  }

  if (code.includes("unavailable") || code.includes("network")) {
    return new Error("Помилка мережі. Перевірте з'єднання та спробуйте знову.");
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Не вдалося завантажити файл. Перевірте Firebase Storage rules.");
}

export async function saveLocalTrackMetadata(
  userId: string,
  track: LocalTrackMetadataDoc
): Promise<void> {
  await setDoc(localTrackDocRef(userId, track.id), {
    ...track,
    updatedAt: serverTimestamp(),
    createdAt: track.createdAt ?? serverTimestamp(),
  });
}

export async function getUserLocalTracks(
  userId: string
): Promise<LocalTrackMetadataDoc[]> {
  const q = query(
    collection(db, "users", userId, "localTracks"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LocalTrackMetadataDoc);
}

export async function getUserLocalTracksTotalSize(userId: string): Promise<number> {
  const tracks = await getUserLocalTracks(userId);
  return tracks.reduce((sum, item) => sum + (item.size || 0), 0);
}

export async function uploadLocalTrack(
  userId: string,
  file: File
): Promise<LocalTrackMetadataDoc> {
  if (!userId) {
    throw new Error("Потрібен вхід у акаунт");
  }

  const isAllowedType = SUPPORTED_AUDIO_MIME_TYPES.includes(
    file.type as (typeof SUPPORTED_AUDIO_MIME_TYPES)[number]
  );
  if (!isAllowedType) {
    throw new Error("Непідтримуваний тип аудіо файлу");
  }

  if (file.size > MAX_LOCAL_TRACK_FILE_SIZE_BYTES) {
    throw new Error("Файл завеликий (макс. 25 MB)");
  }

  const totalBefore = await getUserLocalTracksTotalSize(userId);
  if (totalBefore + file.size > MAX_LOCAL_TRACKS_TOTAL_BYTES) {
    throw new Error("Перевищено ліміт локального сховища 200 MB");
  }

  const id = createTrackId();
  const safeFileName = toSafeFileName(file.name);
  const storagePath = `users/${userId}/local-tracks/${id}/${safeFileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: "public,max-age=3600",
    });
    const downloadUrl = await getDownloadURL(storageRef);

    const metadata: LocalTrackMetadataDoc = {
      id,
      userId,
      title: stripExtension(file.name),
      artist: "Local file",
      source: "local",
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      storagePath,
      downloadUrl,
    };

    await saveLocalTrackMetadata(userId, metadata);
    return metadata;
  } catch (error) {
    throw toUploadError(error);
  }
}

export async function uploadLocalTrackCover(
  userId: string,
  trackId: string,
  file: File,
  existingCoverPath?: string
): Promise<{ coverUrl: string; coverPath: string }> {
  if (!userId) throw new Error("Потрібен вхід у акаунт");

  const isAllowed = SUPPORTED_COVER_MIME_TYPES.includes(
    file.type as (typeof SUPPORTED_COVER_MIME_TYPES)[number]
  );
  if (!isAllowed) {
    throw new Error("Підтримуються PNG, JPG або WEBP");
  }
  if (file.size > MAX_LOCAL_COVER_SIZE_BYTES) {
    throw new Error("Обкладинка завелика (макс. 2 MB)");
  }

  const safeName = toSafeFileName(file.name);
  const coverPath = `users/${userId}/local-tracks/${trackId}/cover/${safeName}`;

  try {
    if (existingCoverPath) {
      try {
        await deleteObject(ref(storage, existingCoverPath));
      } catch {
        // previous cover may be missing
      }
    }

    await uploadBytes(ref(storage, coverPath), file, {
      contentType: file.type,
      cacheControl: "public,max-age=3600",
    });
    const coverUrl = await getDownloadURL(ref(storage, coverPath));

    await setDoc(
      localTrackDocRef(userId, trackId),
      { coverUrl, coverPath, updatedAt: serverTimestamp() },
      { merge: true }
    );

    return { coverUrl, coverPath };
  } catch (error) {
    throw toUploadError(error);
  }
}

export async function deleteLocalTrack(
  userId: string,
  trackId: string,
  storagePath?: string,
  coverPath?: string
): Promise<void> {
  await deleteDoc(localTrackDocRef(userId, trackId));

  const paths = [storagePath, coverPath].filter(Boolean) as string[];
  for (const path of paths) {
    try {
      await deleteObject(ref(storage, path));
    } catch {
      // file may already be removed
    }
  }
}

export async function deleteLocalTrackMetadata(
  userId: string,
  trackId: string
): Promise<void> {
  await deleteDoc(localTrackDocRef(userId, trackId));
}

