import SideMenuItem from "./SideMenuItem";
import YourLibraryList from "./YourLibraryList";
import ThemeToggle from "./ui/ThemeToggle";
import LanguageToggle from "./ui/LanguageToggle";
import { useLanguage } from "../hooks/useLanguage";
import Button from "./ui/Button";
import kawaifyLogo from "../icons/kawaify-logo.png";
import { useAuth } from "../hooks/useAuth";

const AsideMenu = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <nav className="flex flex-col flex-1 gap-2 p-4 h-full kawaify-bg">
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={kawaifyLogo}
            alt="Kawaify Logo"
            className="h-9 w-9 rounded-full drop-shadow-[0_0_12px_rgba(255,192,203,0.7)] hover:scale-105 transition shrink-0"
          />
          <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
            Kawaify
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle compact />
          <ThemeToggle compact />
        </div>
      </div>

      <div className="kawaify-surface rounded-lg p-2 border border-[var(--border)]">
        <ul>
          <SideMenuItem href="/" text={t("nav.home")} />
          {!user && <SideMenuItem href="/login" text={t("nav.login")} />}
          {!user && <SideMenuItem href="/register" text={t("nav.register")} />}
          {user && <SideMenuItem href="/account" text={t("nav.account")} />}
        </ul>
      </div>

      <div className="kawaify-surface rounded-lg p-2 flex-1 border border-[var(--border)]">
        <ul>
          <YourLibraryList />
        </ul>

        {user && (
          <div className="mt-4 px-3">
            <Button type="button" variant="danger" size="sm" onClick={logout}>
              {t("nav.signOut")}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AsideMenu;
