"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const jeux = [
  { id: 1, emoji: "🧠", titre: "Quiz de la semaine", description: "10 questions sur l'actualité du campus et du Sénégal.", regles: "10 participants max — inscription avant mercredi 20h.", couleur: "from-purple-500 to-pink-500" },
  { id: 2, emoji: "🎵", titre: "Blind Test Musical", description: "Reconnais les sons avant tout le monde !", regles: "8 participants — ambiance garantie.", couleur: "from-blue-500 to-cyan-500" },
  { id: 3, emoji: "⚡", titre: "Questions Rapides", description: "30 secondes pour répondre à un max de questions.", regles: "6 participants — rapidité exigée.", couleur: "from-yellow-500 to-orange-500" },
  { id: 4, emoji: "🎭", titre: "Débat Éclair", description: "Défends ton point de vue en 2 minutes chrono.", regles: "4 participants — 2 équipes de 2.", couleur: "from-red-500 to-rose-500" },
  { id: 5, emoji: "🏆", titre: "Génie en Herbe", description: "Le grand jeu de culture générale du campus.", regles: "12 participants — 4 équipes de 3.", couleur: "from-green-500 to-emerald-500" },
  { id: 6, emoji: "🔥", titre: "Défis entre Étudiants", description: "Défie un camarade sur un challenge surprise.", regles: "Inscriptions ouvertes — binômes.", couleur: "from-indigo-500 to-violet-500" },
];

export default function JeuxPage() {
  const [jeuSelectionne, setJeuSelectionne] = useState<number | null>(null);
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const jeu = jeux.find((j) => j.id === jeuSelectionne);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!jeu) return;

    setChargement(true);
    setErreur(null);

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("inscriptions_jeux").insert({
      jeu: jeu.titre,
      nom: formData.get("nom") as string,
      filiere: formData.get("filiere") as string,
      niveau: formData.get("niveau") as string,
      telephone: formData.get("telephone") as string,
    });

    setChargement(false);

    if (error) {
      console.error("Erreur Supabase:", error);
      setErreur("Oups, une erreur s'est produite. Réessaie.");
      return;
    }

    setEnvoye(true);
  }

  function fermerModal() {
    setJeuSelectionne(null);
    setEnvoye(false);
    setErreur(null);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0F0F1A] text-white">
      <Header />

      <section className="flex-1 px-6 py-16 max-w-6xl mx-auto w-full">
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-3 text-center">
          🎮 JEUX & CHALLENGES
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4">
          Entre dans le jeu
        </h1>
        <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
          Participe aux jeux et challenges de Campus Vibes. Choisis ton jeu,
          inscris-toi, et montre de quoi tu es capable pendant l&apos;émission !
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jeux.map((j) => (
            <div key={j.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition flex flex-col">
              <div className={`bg-gradient-to-br ${j.couleur} h-32 flex items-center justify-center text-6xl`}>{j.emoji}</div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{j.titre}</h3>
                <p className="text-white/70 text-sm mb-3">{j.description}</p>
                <p className="text-xs text-yellow-400 mb-4">📌 {j.regles}</p>
                <button onClick={() => setJeuSelectionne(j.id)} className="mt-auto w-full bg-yellow-400 text-black font-bold py-3 rounded-full hover:bg-yellow-300 transition">
                  JE PARTICIPE
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {jeuSelectionne && jeu && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={fermerModal}>
          <div className="bg-[#1A1A2E] border border-white/15 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {envoye ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2 text-yellow-400">Inscription réussie !</h3>
                <p className="text-white/80 mb-6">Tu es inscrit pour <strong>{jeu.titre}</strong>. On te contactera avant l&apos;émission.</p>
                <button onClick={fermerModal} className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-300">FERMER</button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-3xl mb-1">{jeu.emoji}</div>
                    <h3 className="text-xl font-bold">{jeu.titre}</h3>
                  </div>
                  <button onClick={fermerModal} className="text-white/60 hover:text-white text-2xl leading-none">×</button>
                </div>
                <p className="text-sm text-yellow-400 mb-5">📌 {jeu.regles}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" name="nom" placeholder="Prénom et Nom *" required className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="filiere" placeholder="Filière *" required className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
                    <select name="niveau" required className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none">
                      {["L1", "L2", "L3", "M1", "M2", "Doctorat"].map((n) => (
                        <option key={n} value={n} className="bg-[#0F0F1A]">{n}</option>
                      ))}
                    </select>
                  </div>
                  <input type="tel" name="telephone" placeholder="Téléphone / WhatsApp *" required className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
                  {erreur && <div className="bg-red-500/10 border border-red-500 rounded-xl p-3 text-red-400 text-sm">⚠️ {erreur}</div>}
                  <button type="submit" disabled={chargement} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-full hover:bg-yellow-300 transition disabled:opacity-50">
                    {chargement ? "ENVOI..." : "CONFIRMER MON INSCRIPTION"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}