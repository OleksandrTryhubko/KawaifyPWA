import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import LocalMusicImport from "./LocalMusicImport";
import { usePlayerStore } from "../../store/playerStore";
import type { Track } from "../../types/track";

export default function MyMusicPage() {
  const { user, loading } = useAuth();
  const toast = useToast();
  const { setCurrentTrack, setIsPlaying } = usePlayerStore();

  const handlePlayLocalTrack = async (track: Track) => {
    try {
      await setCurrentTrack(track);
      setIsPlaying(true);
    } catch {
      toast.error("Не вдалося запустити локальний трек");
    }
  };

  if (loading) {
    return (
      <div className="kawaify-page">
        <p className="kawaify-text-muted text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="kawaify-page">
        <div className="max-w-lg mx-auto kawaify-card p-8 text-center">
          <span className="text-4xl" aria-hidden>
            🔒
          </span>
          <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            My Music
          </h1>
          <p className="kawaify-text-muted text-sm mt-3">
            Sign in to upload and manage your local audio files.
          </p>
          <div className="mt-5">
            <Link to="/login">
              <Button type="button" variant="primary" size="md">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kawaify-page kawaify-text overflow-x-hidden max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
        My Music
      </h1>
      <LocalMusicImport
        userId={user.uid}
        onPlayTrack={handlePlayLocalTrack}
        showList
        showStorage
        detailedList
      />
    </div>
  );
}
