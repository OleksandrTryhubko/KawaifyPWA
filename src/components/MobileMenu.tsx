import { X } from "lucide-react";
import SideMenuItem from "./SideMenuItem";
import SideMenuCard from "./SideMenuCard";
import { playlists } from "../lib/data";
import kawaifyLogo from "../icons/kawaify-logo.png";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 bg-zinc-900 text-white transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <img
            src={kawaifyLogo}
            alt="Kawaify logo"
            className="h-10 w-10 rounded-full drop-shadow-[0_0_12px_rgba(255,192,203,0.7)] hover:scale-105 transition"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Kawaify
          </span>
        </div>
        <button onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full overflow-y-auto pb-32">
        <nav className="p-4 flex flex-col gap-4">
          {/* Ось тут обгорнуто SideMenuItem в список */}
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <SideMenuItem href="/" text="Home" />
            <SideMenuItem href="/search" text="Search" />
          </ul>

          <div className="border-t border-zinc-800 pt-2">
            <span className="text-sm text-gray-100">Your Library</span>
            <ul className="mt-2 flex flex-col gap-2">
              {playlists.map((playlist) => (
                <SideMenuCard key={playlist?.id} playlist={playlist} />
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
