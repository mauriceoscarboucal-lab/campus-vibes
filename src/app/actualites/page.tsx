"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarteEvenement from "@/components/CarteEvenement";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Evenement = {
  id: string;
  titre: string;
  description: string;
  date_event: string;
  lieu: string;
  categorie: string;
  affiche_url: string | null;
  lien_externe: string | null;
};

export default function ActualitesPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState<string>("tous");

  useEffect(() => {
    async function charger() {
      const { data } = await supabase
        .from("evenements")
        .select("*")
        .order("date_event", { ascending: true });
      setEvenements(data || []);
      setChargement(false);
    }
    charger();
  }, []);

  const categories = ["tous", "Émission", "Conférence", "Sport", "Culture", "Concours", "Atelier", "Assemblée", "Autre"];

  const filtres =
    filtre === "tous"
      ? evenements
      : evenements.filter((ev) => ev.categorie === filtre);

  const maintenant = new Date().toISOString();
  const aVenir = filtres.filter((ev) => ev.date_event >= maintenant);
  const passes = filtres.filter((ev) => ev.date_event < maintenant);

  return (
    <main className="min-h-screen flex flex-col bg-[#0F0F1A] text-white">
      <Header />

      <section className="flex-1 px-6 py-16 max-w-6xl mx-auto w-full">
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-3 text-center">
          📅 AGENDA DU CAMPUS
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4">
          Actualités & Événements
        </h1>
        <p className="text-white/70 text-center mb-10 max-w-2xl mx-auto">
          Ne manque rien de ce qui se passe sur le Campus Fatick. Conférences,
          concours, activités des associations et dates importantes.
        </p>

        {/* FILTRES */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 justify-start md:justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFiltre(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-semibold transition ${
                filtre === c
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-white/5 border-white/15 text-white/80 hover:border-yellow-400/50"
              }`}
            >
              {c === "tous" ? "Tous" : c}
            </button>
          ))}
        </div>

        {chargement ? (
          <div className="text-center py-16 text-white/40">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            Chargement des événements...
          </div>
        ) : (
          <>
            {/* À VENIR */}
            {aVenir.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span>🔜</span> Événements à venir
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aVenir.map((ev) => (
                    <CarteEvenement key={ev.id} evenement={ev} />
                  ))}
                </div>
              </div>
            )}

            {/* PASSÉS */}
            {passes.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white/70">
                  <span>📼</span> Événements passés
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                  {passes.map((ev) => (
                    <CarteEvenement key={ev.id} evenement={ev} />
                  ))}
                </div>
              </div>
            )}

            {aVenir.length === 0 && passes.length === 0 && (
              <div className="text-center py-16 text-white/40">
                <div className="text-4xl mb-3">📭</div>
                Aucun événement pour cette catégorie.
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 text-black text-center">
          <h2 className="text-2xl font-extrabold mb-2">
            Tu organises un événement ?
          </h2>
          <p className="text-black/80 mb-6 max-w-lg mx-auto">
            Associations, clubs, initiatives étudiantes : fais connaître ton
            événement sur Campus Vibes.
          </p>
          <Link
            href="/participer"
            className="inline-block bg-black text-yellow-400 font-bold px-8 py-4 rounded-full hover:bg-black/80 transition"
          >
            📢 FAIRE CONNAÎTRE MON ÉVÉNEMENT
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}