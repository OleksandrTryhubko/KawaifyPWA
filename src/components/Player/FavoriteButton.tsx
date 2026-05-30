import { useState, useEffect } from "react";
import clsx from "clsx";
import { usePlayerStore } from "../../store/playerStore";
import { toggleFavoriteTrack } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

interface FavoriteButtonProps {
  className?: string;
  iconSize?: number;
}

const FavoriteButton = ({ className, iconSize = 20 }: FavoriteButtonProps) => {
  const { currentTrack, setCurrentTrack } = usePlayerStore();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !currentTrack) {
      setIsFavorite(false);
      return;
    }
    setIsFavorite(user.favorites?.includes(currentTrack.id) ?? false);
  }, [user?.favorites, currentTrack?.id]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !currentTrack || busy) return;

    if (isFavorite) {
      setBusy(true);
      try {
        await toggleFavoriteTrack(user.uid, currentTrack.id);
        setIsFavorite(false);
        await refreshUser();
        toast.info("Removed from favorites");
      } catch {
        toast.error("Could not save");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (user.favorites?.includes(currentTrack.id)) {
      toast.warning("Already in favorites");
      setIsFavorite(true);
      return;
    }

    setBusy(true);
    try {
      const result = await toggleFavoriteTrack(user.uid, currentTrack.id);
      if (result === "added") {
        await setCurrentTrack(currentTrack);
        setIsFavorite(true);
        await refreshUser();
        toast.success("Added to favorites");
      } else {
        toast.warning("Already in favorites");
        setIsFavorite(true);
      }
    } catch {
      toast.error("Could not save");
    } finally {
      setBusy(false);
    }
  };

  if (!currentTrack) {
    return (
      <span
        className={clsx("inline-flex items-center justify-center opacity-30", className)}
        aria-hidden
      >
        <AiOutlineHeart size={iconSize} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy || !user}
      className={clsx(
        "inline-flex items-center justify-center rounded-full transition-colors",
        "hover:bg-white/10 disabled:opacity-40 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px]",
        className
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? (
        <AiFillHeart size={iconSize} className="text-pink-500" />
      ) : (
        <AiOutlineHeart size={iconSize} className="text-[var(--text-muted)]" />
      )}
    </button>
  );
};

export default FavoriteButton;
