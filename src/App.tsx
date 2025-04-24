import "./App.css";
import MainSection from "./components/Sections/MainSection";
import AsideMenu from "./components/AsideMenu";
import Player from "./components/Sections/Player";
import MobileMenu from "./components/MobileMenu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlaylistPage from "./pages/PlaylistPage";
import FavoritesPage from "./pages/FavoritesPage";
import { useState } from "react";
import { Routes, Route } from "react-router-dom"; 


function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div
        className="lg:hidden fixed top-1/2 left-0 z-40 w-3 h-12 bg-zinc-700 rounded-r-md opacity-80 hover:opacity-100 transition-opacity"
        onClick={() => setOpen(true)}
      />

      <MobileMenu open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="hidden lg:flex w-64 flex-col overflow-y-auto">
          <AsideMenu />
        </aside>

        <main className="rounded-lg bg-zinc-900 overflow-y-auto pb-20 w-full max-w-none">

          <Routes>
            <Route index element={<MainSection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
      </div>


      <footer className="fixed bottom-0 left-0 w-full z-50 bg-zinc-900 border-t border-zinc-800">
        <Player />
      </footer>
    </div>
  );
}

export default App;
