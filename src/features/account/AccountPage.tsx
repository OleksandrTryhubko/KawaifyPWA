import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const displayName = useMemo(() => {
    const name = user?.displayName?.trim();
    if (name) return name;
    // Fallback: покажемо частину email як "username"
    const email = user?.email ?? "";
    const prefix = email.split("@")[0]?.trim();
    return prefix ? prefix : "Kawaify user";
  }, [user?.displayName, user?.email]);

  const handleSignOut = async () => {
    await logout();
    toast.info("До зустрічі! ♪");
    navigate("/");
  };

  if (!user) {
    return (
      <div className="p-6 text-white">
        <div className="max-w-lg mx-auto bg-zinc-900/80 border border-pink-500/20 rounded-xl p-8 text-center">
          <span className="text-4xl" aria-hidden>
            🔒
          </span>
          <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Потрібен вхід
          </h1>
          <p className="text-zinc-400 text-sm mt-3">
            Будь ласка, увійдіть, щоб подивитися свій акаунт.
          </p>
        </div>
      </div>
    );
  }

  const playlistsCount = user.playlists?.length ?? 0;
  const favoritesCount = user.favorites?.length ?? 0;

  return (
    <div className="p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900/80 border border-pink-500/20 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-xl border border-pink-500/20 shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/10"
              aria-label="Аватар"
            >
              <span className="text-3xl" aria-hidden>
                (≧◡≦)
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {displayName}
              </h1>
              <p className="text-zinc-300 text-sm truncate mt-1">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
              <div className="text-xs text-zinc-400">Playlists</div>
              <div className="text-xl font-bold mt-1">{playlistsCount}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
              <div className="text-xs text-zinc-400">Favorites</div>
              <div className="text-xl font-bold mt-1">{favoritesCount}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
              <div className="text-xs text-zinc-400">Listening time</div>
              <div className="text-xl font-bold mt-1 text-pink-200/90">
                скоро
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-5 bg-zinc-900/80 border border-purple-500/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-pink-200">
            Coming soon
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            AI assistant, local music, equalizer — у наступних оновленнях ♪
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-200">
              AI assistant
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-200">
              Local music
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-200">
              Equalizer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
