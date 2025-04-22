import "./App.css";
import MainSection from "./components/Sections/MainSection";
import AsideMenu from "./components/AsideMenu";
import Player from "./components/Sections/Player";
import MobileMenu from "./components/MobileMenu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/profile";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Кнопка-бургер */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-zinc-900 text-white p-2 rounded shadow-md"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      <MobileMenu open={open} onClose={() => setOpen(false)} />

      {/* Контейнер контенту */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Сайдбар — тільки на десктопі */}
        <aside className="hidden lg:flex w-64 flex-col overflow-y-auto">
          <AsideMenu />
        </aside>

        {/* Головний контент */}
        <main className="rounded-lg bg-zinc-900 overflow-y-auto pb-20 w-full max-w-none">

          <Routes>
            <Route index element={<MainSection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:uid" element={<Profile />} />
          </Routes>
        </main>
      </div>

      {/* Плеєр */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-zinc-900 border-t border-zinc-800">
        <Player />
      </footer>
    </div>
  );
}

export default App;
