import { X } from "lucide-react";
import SideMenuItem from "./SideMenuItem";
import YourLibraryList from "./YourLibraryList";
import kawaifyLogo from "../icons/kawaify-logo.png";
import { useAuth } from "../hooks/useAuth";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const { user, logout } = useAuth();

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
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <SideMenuItem href="/" text="Home" />
            {!user && <SideMenuItem href="/login" text="Login" />}
            {!user && <SideMenuItem href="/register" text="Register" />}
          </ul>

          <div className="border-t border-zinc-800 pt-2">
            <span className="text-sm text-gray-100">Your Library</span>
            <ul className="mt-2 flex flex-col gap-2">
              <YourLibraryList />
            </ul>

            {user && (
              <div className="mt-4 px-1">
                <button
                  onClick={() => {
                    logout();
                    onClose(); 
                  }}
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  SingOut
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
