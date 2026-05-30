import { useState } from "react";
import clsx from "clsx";
import { ListPlus } from "lucide-react";
import PlaylistModal from "./PlaylistModal";

interface AddToPlaylistButtonProps {
  className?: string;
}

const AddToPlaylistButton = ({ className }: AddToPlaylistButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={clsx(
          "inline-flex items-center justify-center rounded-full transition-colors",
          "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/10",
          "min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px]",
          className
        )}
        aria-label="Add to playlist"
      >
        <ListPlus className="h-[18px] w-[18px]" />
      </button>
      <PlaylistModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default AddToPlaylistButton;
