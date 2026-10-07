"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const typesTalents = [
  { emoji: "🎤", nom: "Chant" },
  { emoji: "🎸", nom: "Musique" },
  { emoji: "🎙️", nom: "Slam" },
  { emoji: "📝", nom: "Poésie" },
  { emoji: "💃", nom: "Danse" },
  { emoji: "🚀", nom: "Entrepreneuriat" },
  { emoji: "⚽", nom: "Sport" },
  { emoji: "💻", nom: "Informatique" },
  { emoji: "🎨", nom: "Art" },
  { emoji: "✨", nom: "Autre" },
];

export default function TalentsPage() {
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [talentChoisi, setTalentChoisi] = useState("Chant");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("talents").insert({
      prenom: formData.get("prenom") as string,
      nom: formData.get("nom") as string,
      filiere: formData.get("filiere") as string,
      niveau: formData.get("niveau") as string,
      telephone: formData.get("telephone") as string,
      type_talent: talentChoisi,
      description: formData.get("description") as string,
      lien_externe: (formData.get("lien_externe") as string) || null,
    });

    setChargement(false);

    if (error) {
      console.error("Erreur Supabase:", error);
      setErreur("Oups, une erreur s'est produite. Réessaie.");
      return;
    }

    setEnvoye(true);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0F0F1A] text-white">
      <Header />

      <section className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-3 text-center">
          ⭐ CAMPUS TALENT
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4">
          Montre ton talent
        </h1>
        <p className="text-white/70 text-center mb-10">
          Tu as un talent à partager ? Musique, slam, danse, code, art…
          Propose-le et tu pourrais être le <strong className="text-yellow-400">Talent de la semaine</strong> sur Campus Vibes !
        </p>

        {envoye ? (
          <div className="bg-yellow-400/10 border-2 border-yellow-400 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">⭐</div>
            <h2 className="text-2xl font-bold mb-3 text-yellow-400">Candidature reçue !</h2>
            <p className="text-white/80">
              Merci ! L&apos;équipe de Campus Vibes étudiera ta proposition.
              Si ton talent est retenu, tu seras contacté pour la rubrique <strong>Talent de la semaine</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Prénom *</label>
                <input type="text" name="prenom" required placeholder="Prénom" className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nom *</label>
                <input type="text" name="nom" required placeholder="Nom" className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Filière *</label>
                <input type="text" name="filiere" required placeholder="Ex: Informatique" className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Niveau *</label>
                <select name="niveau" required className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none">
                  {["L1", "L2", "L3", "M1", "M2", "Doctorat"].map((n) => (
                    <option key={n} value={n} className="bg-[#0F0F1A]">{n}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone / WhatsApp *</label>
              <input type="tel" name="telephone" required placeholder="+221 ..." className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Quel est ton talent ? *</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {typesTalents.map((t) => (
                  <button
                    key={t.nom}
                    type="button"
                    onClick={() => setTalentChoisi(t.nom)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition ${
                      talentChoisi === t.nom
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-white/5 border-white/15 text-white/80 hover:border-yellow-400/50"
                    }`}
                  >
                    <div className="text-xl mb-1">{t.emoji}</div>
                    {t.nom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Décris ton talent *</label>
              <textarea name="description" required rows={4} placeholder="Parle-nous de ton talent, depuis combien de temps tu le pratiques..." className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Lien vers ton travail (optionnel)</label>
              <input type="url" name="lien_externe" placeholder="https://youtube.com/... ou https://tiktok.com/..." className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none" />
            </div>

            {erreur && (
              <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm">⚠️ {erreur}</div>
            )}

            <button type="submit" disabled={chargement} className="w-full bg-yellow-400 text-black font-bold py-4 rounded-full hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {chargement ? "ENVOI EN COURS..." : "PROPOSER MON TALENT"}
            </button>
          </form>
        )}
      </section>

      <Footer />
    </main>
  );
}