import { useState } from "react";
import PlaylistModal from "./PlaylistModal";

const AddToPlaylistButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-white">
        ➕
      </button>
      <PlaylistModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default AddToPlaylistButton;