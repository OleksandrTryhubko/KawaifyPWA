import SideMenuItem from "./SideMenuItem";
import YourLibraryList from "./YourLibraryList";
import kawaifyLogo from "../icons/kawaify-logo.png";
import { useAuth } from "../hooks/useAuth";

const AsideMenu = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="flex flex-col flex-1 gap-2 p-4">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3">
          <img
            src={kawaifyLogo}
            alt="Kawaify Logo"
            className="h-10 w-10 rounded-full drop-shadow-[0_0_12px_rgba(255,192,203,0.7)] hover:scale-105 transition"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Kawaify
          </span>
        </div>

        {/* Основні навігаційні кнопки */}
        <div className="bg-zinc-900 rounded-lg p-2">
          <ul>
            <SideMenuItem href="/" text="Home" />
            {!user && <SideMenuItem href="/login" text="Login" />}
            {!user && <SideMenuItem href="/register" text="Register" />}
          </ul>
        </div>

        {/* Бібліотека користувача */}
        <div className="bg-zinc-900 rounded-lg p-2 flex-1">
          <ul>
            <YourLibraryList />
          </ul>

          {/* Кнопка виходу */}
          {user && (
            <div className="mt-4 px-5">
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-700 transition"
              >
                SingOut
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default AsideMenu;
