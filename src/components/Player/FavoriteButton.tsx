import { useState, useEffect } from "react";
import { usePlayerStore } from "../../store/playerStore";
import { toggleFavoriteTrack } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const FavoriteButton = () => {
  const { currentTrack } = usePlayerStore();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!user || !currentTrack) return;
    setIsFavorite(user.favorites?.includes(currentTrack.id));
  }, [user, currentTrack]);

  const handleToggle = async () => {
    if (!user || !currentTrack) return;
    await toggleFavoriteTrack(user.uid, currentTrack.id);
    setIsFavorite(!isFavorite);
  };

  if (!currentTrack) return null;

  return (
    <button onClick={handleToggle} className="text-white">
      {isFavorite ? <AiFillHeart size={24} className="text-pink-500" /> : <AiOutlineHeart size={24} />}
    </button>
  );
};

export default FavoriteButton;