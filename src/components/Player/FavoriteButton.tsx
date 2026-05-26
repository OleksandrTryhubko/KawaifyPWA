import { useState, useEffect } from "react";
import { usePlayerStore } from "../../store/playerStore";
import { toggleFavoriteTrack } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const FavoriteButton = () => {
  const { currentTrack } = usePlayerStore();
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
  }, [user, currentTrack]);

  const handleToggle = async () => {
    if (!user || !currentTrack || busy) return;

    if (isFavorite) {
      setBusy(true);
      try {
        await toggleFavoriteTrack(user.uid, currentTrack.id);
        setIsFavorite(false);
        await refreshUser();
        toast.info("Трек видалено з обраного");
      } catch {
        toast.error("Помилка при збереженні");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (user.favorites?.includes(currentTrack.id)) {
      toast.warning("Трек вже є в обраному");
      setIsFavorite(true);
      return;
    }

    setBusy(true);
    try {
      const result = await toggleFavoriteTrack(user.uid, currentTrack.id);
      if (result === "added") {
        setIsFavorite(true);
        await refreshUser();
        toast.success("Трек додано в обране");
      } else {
        toast.warning("Трек вже є в обраному");
        setIsFavorite(true);
      }
    } catch {
      toast.error("Помилка при збереженні");
    } finally {
      setBusy(false);
    }
  };

  if (!currentTrack) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy || !user}
      className="text-white disabled:opacity-50"
      aria-label={isFavorite ? "Видалити з обраного" : "Додати в обране"}
    >
      {isFavorite ? (
        <AiFillHeart size={24} className="text-pink-500" />
      ) : (
        <AiOutlineHeart size={24} />
      )}
    </button>
  );
};

export default FavoriteButton;
