import { useEffect } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import SideMenuItem from "./SideMenuItem";
import YourLibraryList from "./YourLibraryList";
import ThemeToggle from "./ui/ThemeToggle";
import Button from "./ui/Button";
import kawaifyLogo from "../icons/kawaify-logo.png";
import { useAuth } from "../hooks/useAuth";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu = ({ open, onClose }: MobileMenuProps) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const handleNavigate = () => onClose();

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-[min(320px,88vw)] kawaify-surface text-[var(--text)]",
          "transform transition-transform duration-300 ease-out lg:hidden shadow-xl",
          "border-r border-[var(--border)] flex flex-col",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <img
              src={kawaifyLogo}
              alt="Kawaify logo"
              className="h-10 w-10 rounded-full drop-shadow-[0_0_12px_rgba(255,192,203,0.7)]"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
              Kawaify
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-soft)] focus-visible:ring-2 focus-visible:ring-pink-400/50"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-8">
          <nav className="p-4 flex flex-col gap-4">
            <div className="flex justify-end">
              <ThemeToggle compact />
            </div>

            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              <SideMenuItem href="/" text="Home" onNavigate={handleNavigate} />
              {!user && (
                <SideMenuItem href="/login" text="Login" onNavigate={handleNavigate} />
              )}
              {!user && (
                <SideMenuItem href="/register" text="Register" onNavigate={handleNavigate} />
              )}
              {user && (
                <SideMenuItem href="/account" text="Account" onNavigate={handleNavigate} />
              )}
            </ul>

            <div className="border-t border-[var(--border)] pt-3">
              <span className="text-sm kawaify-text-muted px-3">Your Library</span>
              <ul className="mt-2 flex flex-col gap-1">
                <YourLibraryList onNavigate={handleNavigate} />
              </ul>

              {user && (
                <div className="mt-4 px-1">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
