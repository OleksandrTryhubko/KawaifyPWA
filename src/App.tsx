import "./App.css";
import MainSection from "./components/Sections/MainSection";
import AsideMenu from "./components/AsideMenu";
import Player from "./components/Sections/Player";
import MobileMenu from "./components/MobileMenu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlaylistPage from "./pages/PlaylistPage";
import FavoritesPage from "./pages/FavoritesPage";
import AccountPage from "./features/account/AccountPage";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col kawaify-bg">
      <button
        type="button"
        className="lg:hidden fixed top-1/2 left-0 z-30 w-3 h-14 bg-[var(--surface-soft)] rounded-r-md opacity-80 hover:opacity-100 transition-opacity border border-[var(--border)] border-l-0"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      />

      <MobileMenu open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)]">
          <AsideMenu />
        </aside>

        <main className="flex-1 kawaify-surface overflow-y-auto overflow-x-hidden w-full min-w-0 pb-32 sm:pb-28 lg:pb-24">
          <Routes>
            <Route index element={<MainSection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
      </div>

      <footer
        className="fixed bottom-0 left-0 w-full z-50 border-t border-[var(--border)]"
        style={{ backgroundColor: "var(--player-bg)" }}
      >
        <Player />
      </footer>
    </div>
  );
}

export default App;
