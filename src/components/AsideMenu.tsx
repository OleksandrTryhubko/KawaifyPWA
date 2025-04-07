import SideMenuItem from "./SideMenuItem";
import SideMenuCard from "./SideMenuCard";
import kawaifyLogo from "../icons/kawaify-logo.png"; // твоє лого
import { playlists } from "../lib/data";

const AsideMenu = () => {
  return (
    <>
      <nav className="flex flex-col flex-1 gap-2 p-4">
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

        <div className="bg-zinc-900 rounded-lg p-2">
          <ul>
            <SideMenuItem href="/" text="Home" />
            <SideMenuItem href="/search" text="Search" />
          </ul>
        </div>

        <div className="bg-zinc-900 rounded-lg p-2 flex-1">
          <ul>
            <SideMenuItem href="/" text="Library" />
            {playlists.map((playlist) => (
              <SideMenuCard key={playlist?.id} playlist={playlist} />
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default AsideMenu;
