import { fetchAudiusTracks } from "../api/audius";
import type { AudiusTrack } from "../types/audius";

const GENRE_POOL = [
  "lofi",
  "hip-hop",
  "pop",
  "rock",
  "dance",
  "ambient",
  "jazz",
  "chillwave",
  "phonk",
  "electronic",
  "indie",
  "r&b",
  "house",
  "soul",
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomGenres(count: number): string[] {
  return shuffle(GENRE_POOL).slice(0, count);
}

export function dedupeAudiusTracks(tracks: AudiusTrack[]): AudiusTrack[] {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

/** Fetch random popular tracks from multiple genres */
export async function fetchRandomRecommendations(
  batchSize = 24,
  excludeIds: string[] = []
): Promise<AudiusTrack[]> {
  const genreCount = 2 + Math.floor(Math.random() * 2);
  const genres = pickRandomGenres(genreCount);
  const perGenre = Math.ceil(batchSize / genres.length);
  const exclude = new Set(excludeIds);

  const results = await Promise.all(
    genres.map((genre) =>
      fetchAudiusTracks(genre, perGenre + 8).catch(() => [] as AudiusTrack[])
    )
  );

  const merged = shuffle(results.flat());
  const unique = dedupeAudiusTracks(merged).filter((t) => !exclude.has(t.id));
  return unique.slice(0, batchSize);
}

export function getRandomGenre(): string {
  return GENRE_POOL[Math.floor(Math.random() * GENRE_POOL.length)];
}
