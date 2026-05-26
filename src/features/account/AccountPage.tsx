import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import { uploadUserAvatar } from "./accountService";

export default function AccountPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Підтримуються PNG, JPG або WEBP");
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error("Файл завеликий (макс. 2 MB)");
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadAvatar = async () => {
    if (!user || !selectedFile || uploading) return;

    setUploading(true);
    try {
      await uploadUserAvatar(user.uid, selectedFile);
      await refreshUser();
      setSelectedFile(null);
      toast.success("Аватар оновлено успішно ♪");
    } catch {
      toast.error("Не вдалося завантажити аватар. Спробуй ще раз.");
    } finally {
      setUploading(false);
    }
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
  const avatarSrc = previewUrl || user.avatar || "";

  return (
    <div className="p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900/80 border border-pink-500/20 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border border-pink-500/20 shadow-lg overflow-hidden bg-gradient-to-br from-pink-500/20 to-purple-500/10">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  aria-label="Аватар"
                >
                  <span className="text-3xl" aria-hidden>
                    (≧◡≦)
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {displayName}
              </h1>
              <p className="text-zinc-300 text-sm truncate mt-1">
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    disabled={uploading}
                  />
                  <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition cursor-pointer">
                    Upload avatar
                  </span>
                </label>

                {selectedFile && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={uploading}
                    onClick={handleUploadAvatar}
                  >
                    {uploading ? "Uploading…" : "Save"}
                  </Button>
                )}

                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploading}
                    onClick={() => setSelectedFile(null)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
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
            <Button type="button" variant="danger" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
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
