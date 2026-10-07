"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setChargement(false);

    if (error) {
      setErreur("Email ou mot de passe incorrect.");
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-yellow-400 text-sm hover:underline mb-6 inline-block"
        >
          ← Retour au site
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-extrabold mb-2">Espace Admin</h1>
            <p className="text-white/60 text-sm">
              Réservé à l&apos;équipe de Campus Vibes
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@campusvibes.sn"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            {erreur && (
              <div className="bg-red-500/10 border border-red-500 rounded-xl p-3 text-red-400 text-sm">
                ⚠️ {erreur}
              </div>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-yellow-400 text-black font-bold py-4 rounded-full hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {chargement ? "CONNEXION..." : "SE CONNECTER"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} Campus Vibes — USSEIN Fatick
        </p>
      </div>
    </main>
  );
}