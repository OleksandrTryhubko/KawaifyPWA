import type { UserStats } from "../types/user";

export const DEFAULT_USER_STATS: UserStats = {
  listeningSeconds: 0,
  tracksPlayed: 0,
};

export function parseUserStats(data: Record<string, unknown> | undefined): UserStats {
  const raw = data?.stats;
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_USER_STATS };
  }

  const stats = raw as Record<string, unknown>;
  return {
    listeningSeconds: Math.max(0, Number(stats.listeningSeconds) || 0),
    tracksPlayed: Math.max(0, Number(stats.tracksPlayed) || 0),
  };
}
