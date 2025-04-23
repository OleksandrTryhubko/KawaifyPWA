import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUser } from "../services/userService";
import { auth } from "../lib/firebase";
import { Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await createUser(email, res.user.uid); // тільки тут, а не прямо в Register.tsx
      alert("Реєстрація успішна!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md shadow-lg">
        <h1 className="text-white text-2xl font-bold text-center mb-6">Sign up for Kawaify</h1>

        <label className="block text-sm mb-1">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleRegister}
          className="w-full bg-purple-600 hover:bg-purple-700 font-semibold py-2 px-4 rounded mb-4"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
