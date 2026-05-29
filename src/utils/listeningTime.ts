/** Formats seconds as Ukrainian listening time labels. */
export function formatListeningTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours === 0) {
    return `${minutes} хв`;
  }

  return `${hours} год ${String(minutes).padStart(2, "0")} хв`;
}
