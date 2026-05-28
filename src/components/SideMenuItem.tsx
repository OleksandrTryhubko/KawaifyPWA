import { GrHomeRounded } from "react-icons/gr";
import { FiLogIn, FiUserPlus, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";

interface SideMenuProps {
  href?: string;
  text: string;
  onNavigate?: () => void;
}

const linksMap: Record<string, JSX.Element> = {
  Home: <GrHomeRounded size={22} />,
  Login: <FiLogIn size={20} />,
  Register: <FiUserPlus size={20} />,
  Account: <FiUser size={20} />,
};

const SideMenuItem = ({ href = "/", text, onNavigate }: SideMenuProps) => {
  return (
    <li>
      <Link
        to={href}
        onClick={onNavigate}
        className="flex gap-3 text-[var(--text-muted)] hover:text-[var(--text)] items-center py-2.5 px-4 font-medium transition rounded-lg hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50"
      >
        {linksMap[text]}
        {text === "Library" ? "Your " + text : text}
      </Link>
    </li>
  );
};

export default SideMenuItem;
