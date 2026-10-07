"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function SujetsPage() {
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("sujets").insert({
      prenom: formData.get("prenom") as string,
      nom: formData.get("nom") as string,
      filiere: formData.get("filiere") as string,
      niveau: formData.get("niveau") as string,
      titre: formData.get("titre") as string,
      description: formData.get("description") as string,
    });

    setChargement(false);

    if (error) {
      console.error("Erreur Supabase:", error);
      setErreur("Oups, une erreur s'est produite. Réessaie dans un instant.");
      return;
    }

    setEnvoye(true);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0F0F1A] text-white">
      <Header />

      <section className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-3 text-center">
          💡 PROPOSE UN SUJET
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4">
          Un sujet à débattre ?
        </h1>
        <p className="text-white/70 text-center mb-10">
          Tu veux qu&apos;un sujet soit discuté dans l&apos;émission ? Propose-le
          nous. L&apos;équipe étudiera ta proposition pour une prochaine émission.
        </p>

        {envoye ? (
          <div className="bg-yellow-400/10 border-2 border-yellow-400 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">💡</div>
            <h2 className="text-2xl font-bold mb-3 text-yellow-400">
              Sujet proposé !
            </h2>
            <p className="text-white/80">
              Merci ! Ta proposition a bien été transmise à l&apos;équipe de Campus
              Vibes. Nous te tiendrons au courant si ton sujet est retenu.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ton prénom *
                </label>
                <input
                  type="text"
                  name="prenom"
                  required
                  placeholder="Prénom"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Ton nom *
                </label>
                <input
                  type="text"
                  name="nom"
                  required
                  placeholder="Nom"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Filière *
                </label>
                <input
                  type="text"
                  name="filiere"
                  required
                  placeholder="Ex: Informatique"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Niveau *
                </label>
                <select
                  name="niveau"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                >
                  {["L1", "L2", "L3", "M1", "M2", "Doctorat"].map((n) => (
                    <option key={n} value={n} className="bg-[#0F0F1A]">
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Titre de ton sujet *
              </label>
              <input
                type="text"
                name="titre"
                required
                placeholder="Ex: La place des femmes dans les filières scientifiques"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Pourquoi ce sujet est important ? *
              </label>
              <textarea
                name="description"
                required
                rows={5}
                placeholder="Explique en quelques lignes pourquoi ce sujet mérite d'être débattu dans l'émission..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            {erreur && (
              <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm">
                ⚠️ {erreur}
              </div>
            )}

            <button
              type="submit"
              disabled={chargement}
              className="w-full bg-yellow-400 text-black font-bold py-4 rounded-full hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chargement ? "ENVOI EN COURS..." : "PROPOSER MON SUJET"}
            </button>
          </form>
        )}
      </section>

      <Footer />
    </main>
  );
}