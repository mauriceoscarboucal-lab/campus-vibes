"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default function ParticiperPage() {
  const [envoye, setEnvoye] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);

    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("candidatures").insert({
      prenom: formData.get("prenom") as string,
      nom: formData.get("nom") as string,
      filiere: formData.get("filiere") as string,
      niveau: formData.get("niveau") as string,
      telephone: formData.get("telephone") as string,
      rubrique: formData.get("rubrique") as string,
      motivation: formData.get("motivation") as string,
      presentation: formData.get("presentation") as string,
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
          🎤 REJOINS L&apos;ÉMISSION
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4">
          Participer à Campus Vibes
        </h1>
        <p className="text-white/70 text-center mb-10">
          Remplis ce formulaire et l&apos;équipe te contactera pour la prochaine émission.
        </p>

        {envoye ? (
          <div className="bg-yellow-400/10 border-2 border-yellow-400 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-3 text-yellow-400">
              Candidature envoyée !
            </h2>
            <p className="text-white/80">
              Merci ! L&apos;équipe de Campus Vibes te contactera bientôt sur WhatsApp pour te
              confirmer ta participation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Prénom" name="prenom" required />
              <Field label="Nom" name="nom" required />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Filière" name="filiere" required placeholder="Ex: Informatique" />
              <Select
                label="Niveau"
                name="niveau"
                options={["L1", "L2", "L3", "M1", "M2", "Doctorat"]}
              />
            </div>

            <Field label="Téléphone / WhatsApp" name="telephone" required placeholder="+221 ..." />

            <Select
              label="Rubrique souhaitée"
              name="rubrique"
              options={[
                "Invité de la semaine",
                "Débat",
                "Jeux / Quiz",
                "Talent",
                "Micro-trottoir",
                "Autre",
              ]}
            />

            <div>
              <label className="block text-sm font-semibold mb-2">
                Ce que tu souhaites faire dans l&apos;émission *
              </label>
              <textarea
                name="motivation"
                required
                rows={3}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                placeholder="Ex: présenter un talent, participer à un débat..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Présente-toi en quelques lignes *
              </label>
              <textarea
                name="presentation"
                required
                rows={4}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                placeholder="Ton parcours, tes passions..."
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
              {chargement ? "ENVOI EN COURS..." : "ENVOYER MA CANDIDATURE"}
            </button>
          </form>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label} {required && "*"}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label} *</label>
      <select
        name={name}
        required
        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0F0F1A]">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}