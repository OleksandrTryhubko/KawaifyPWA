export default function LocalMusicImport() {
  return (
    <div className="p-4 bg-zinc-900/90 border border-pink-500/20 rounded-xl">
      <h2 className="text-lg font-semibold text-pink-300">Локальна музика</h2>
      <p className="text-sm text-zinc-400 mt-2">
        Імпорт mp3, wav, ogg, flac з пристрою — скоро. Метадані готові в{" "}
        <code className="text-pink-400/80">localMusicService</code>.
      </p>
    </div>
  );
}
