import type { LocalTrackMetadata } from "../../types/track";
import {
  SUPPORTED_AUDIO_EXTENSIONS,
  SUPPORTED_AUDIO_MIME_TYPES,
  type BasicAudioMetadata,
  type LocalFileValidationResult,
} from "./types";

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
}

export function validateAudioFile(file: File): LocalFileValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, error: "Файл порожній або недоступний" };
  }

  const ext = getExtension(file.name);
  const mimeOk = SUPPORTED_AUDIO_MIME_TYPES.some(
    (m) => file.type === m || file.type.startsWith("audio/")
  );
  const extOk = SUPPORTED_AUDIO_EXTENSIONS.includes(
    ext as (typeof SUPPORTED_AUDIO_EXTENSIONS)[number]
  );

  if (!mimeOk && !extOk) {
    return {
      valid: false,
      error: "Підтримуються mp3, wav, ogg, flac (залежить від браузера)",
    };
  }

  const maxSizeMb = 50;
  if (file.size > maxSizeMb * 1024 * 1024) {
    return { valid: false, error: `Файл завеликий (макс. ${maxSizeMb} МБ)` };
  }

  return { valid: true };
}

export async function extractBasicMetadata(
  file: File
): Promise<BasicAudioMetadata> {
  const title = file.name.replace(/\.[^.]+$/, "") || "Local track";
  let durationSeconds: number | undefined;

  try {
    durationSeconds = await readAudioDuration(file);
  } catch {
    durationSeconds = undefined;
  }

  return {
    title,
    fileName: file.name,
    mimeType: file.type || "audio/mpeg",
    size: file.size,
    durationSeconds,
  };
}

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Cannot read audio metadata"));
    };

    audio.src = url;
  });
}

function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export async function createLocalTrackFromFile(
  file: File,
  userId: string
): Promise<LocalTrackMetadata> {
  const validation = validateAudioFile(file);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid audio file");
  }

  const meta = await extractBasicMetadata(file);
  const objectUrl = URL.createObjectURL(file);
  const id = `local-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    id,
    title: meta.title,
    artists: ["Local"],
    duration: formatDuration(meta.durationSeconds),
    image: "",
    streamUrl: objectUrl,
    source: "local",
    objectUrl,
    fileName: meta.fileName,
    mimeType: meta.mimeType,
    size: meta.size,
    userId,
    storagePath: undefined,
  };
}

/** Persists metadata only — file upload to Storage is a future step */
export { saveLocalTrackMetadata } from "../../services/firestoreService";
