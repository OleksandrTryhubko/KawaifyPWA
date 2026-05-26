import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { getFirebaseAuthErrorMessage } from "../utils/firebaseAuthErrors";
import { useToast } from "../hooks/useToast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e?: FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Вхід виконано успішно! Welcome back to Kawaify ♪");
      navigate("/");
    } catch (err: unknown) {
      toast.error(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-900 p-8 rounded-lg w-full max-w-md shadow-lg border border-pink-500/10"
      >
        <h1 className="text-white text-2xl font-bold text-center mb-6">
          Log in to Kawaify
        </h1>

        <label className="block text-sm mb-1">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-pink-500/50 disabled:opacity-60"
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-pink-500/50 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold py-2 px-4 rounded mb-4 transition"
        >
          {loading ? "Вхід…" : "Log In"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-white underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
