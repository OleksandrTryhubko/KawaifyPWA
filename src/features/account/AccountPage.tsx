import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import { uploadUserAvatar } from "./accountService";
import LocalMusicImport from "../local-music/LocalMusicImport";
import ProfileStatsGrid from "../../components/account/ProfileStatsGrid";
import UserActivityBlock from "../../components/account/UserActivityBlock";
import AssistantAccountBlock from "../../components/account/AssistantAccountBlock";
import { useLanguage } from "../../hooks/useLanguage";
import { getUserLocalTracks } from "../local-music/localTracksMetadataService";

export default function AccountPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localTracksCount, setLocalTracksCount] = useState(0);

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
    toast.info(t("toast.goodbye"));
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
      toast.error(t("toast.fileType"));
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(t("toast.fileSize"));
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
      toast.success(t("toast.avatarUpdated"));
    } catch {
      toast.error(t("toast.avatarError"));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      setLocalTracksCount(0);
      return;
    }
    getUserLocalTracks(user.uid)
      .then((tracks) => setLocalTracksCount(tracks.length))
      .catch(() => setLocalTracksCount(0));
  }, [user?.uid]);

  if (!user) {
    return (
      <div className="kawaify-page">
        <div className="max-w-lg mx-auto kawaify-card p-8 text-center">
          <span className="text-4xl" aria-hidden>
            🔒
          </span>
          <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {t("account.signInRequired")}
          </h1>
          <p className="kawaify-text-muted text-sm mt-3">
            {t("account.signInHint")}
          </p>
        </div>
      </div>
    );
  }

  const avatarSrc = previewUrl || user.avatar || "";

  return (
    <div className="kawaify-page">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="kawaify-card p-6 sm:p-8">
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
              <p className="kawaify-text-muted text-sm truncate mt-1">
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
                  <span className="text-xs px-3 py-1 rounded-full kawaify-surface border border-[var(--border)] text-[var(--text)] hover:opacity-90 transition cursor-pointer">
                    {t("account.uploadAvatar")}
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
                    {uploading ? t("common.loading") : t("account.save")}
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
                    {t("account.cancel")}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ProfileStatsGrid user={user} localTracksCount={localTracksCount} />

          <div className="mt-5 flex justify-end">
            <Button type="button" variant="danger" size="sm" onClick={handleSignOut}>
              {t("account.signOut")}
            </Button>
          </div>
        </div>

        <AssistantAccountBlock />

        <LocalMusicImport
          userId={user.uid}
          compact
          showList={false}
          showStorage
        />

        <UserActivityBlock />

      </div>
    </div>
  );
}
