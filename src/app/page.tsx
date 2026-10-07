"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CarteEvenement from "@/components/CarteEvenement";

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

type Config = {
  prochaine_emission_date: string | null;
  prochaine_emission_theme: string | null;
  prochaine_emission_invites: string | null;
  prochaine_emission_affiche_url: string | null;
  prochaine_emission_lien_live: string | null;
};

export default function Home() {
  const [config, setConfig] = useState<Config | null>(null);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [tempsRestant, setTempsRestant] = useState({
    jours: 0,
    heures: 0,
    minutes: 0,
    secondes: 0,
  });

  // Charger config + événements
  useEffect(() => {
    async function charger() {
      const { data: cfg } = await supabase
        .from("config")
        .select("*")
        .eq("id", 1)
        .single();
      if (cfg) setConfig(cfg);

      const now = new Date().toISOString();
      const { data: evs } = await supabase
        .from("evenements")
        .select("*")
        .gte("date_event", now)
        .order("date_event", { ascending: true })
        .limit(3);
      setEvenements(evs || []);
    }
    charger();
  }, []);

  // Compte à rebours
  useEffect(() => {
    if (!config?.prochaine_emission_date) return;

    const cible = new Date(config.prochaine_emission_date);

    function tick() {
      const diff = cible.getTime() - new Date().getTime();
      if (diff > 0) {
        setTempsRestant({
          jours: Math.floor(diff / (1000 * 60 * 60 * 24)),
          heures: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          secondes: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTempsRestant({ jours: 0, heures: 0, minutes: 0, secondes: 0 });
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [config]);

  const dateEmission = config?.prochaine_emission_date
    ? new Date(config.prochaine_emission_date)
    : null;

  const dateFormatee = dateEmission
    ? dateEmission
        .toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
        .toUpperCase() +
      " — " +
      dateEmission.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).replace(":", "H")
    : "";

  const rubriques = [
    { emoji: "📰", titre: "Actu du campus", href: "/actualites" },
    { emoji: "🎤", titre: "Invité de la semaine", href: "/participer" },
    { emoji: "💬", titre: "Débat", href: "/sujets" },
    { emoji: "🎮", titre: "Jeux", href: "/jeux" },
    { emoji: "⭐", titre: "Talents", href: "/talents" },
    { emoji: "🎥", titre: "Micro-trottoir", href: "/participer" },
    { emoji: "❓", titre: "Vos questions", href: "/questions" },
    { emoji: "🎶", titre: "Ambiance", href: "/participer" },
  ];

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0F0F1A] sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Campus Vibes"
            width={50}
            height={50}
            className="rounded-xl"
          />
          <span className="font-bold text-lg tracking-tight text-white">
            CAMPUS VIBES
          </span>
        </Link>
        <nav className="hidden md:flex gap-5 text-sm text-white/80">
          <Link href="/" className="hover:text-yellow-400 transition">Accueil</Link>
          <Link href="/emissions" className="hover:text-yellow-400 transition">Émissions</Link>
          <Link href="/participer" className="hover:text-yellow-400 transition">Participer</Link>
          <Link href="/questions" className="hover:text-yellow-400 transition">Questions</Link>
          <Link href="/talents" className="hover:text-yellow-400 transition">Talents</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="px-6 pt-16 pb-12 text-center max-w-5xl mx-auto">
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-4">
          🎙️ ÉMISSION ÉTUDIANTE — CAMPUS USSEIN FATICK
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Les étudiants, <span className="text-yellow-400">leurs voix</span>,<br />
          leurs histoires.
        </h1>
        <p className="text-white/70 max-w-2xl mx-auto mb-10 text-lg">
          Bienvenue dans <strong className="text-white">Campus Vibes</strong>, le rendez-vous
          hebdomadaire des étudiants du Campus Fatick.
        </p>
      </section>

      {/* PROCHAINE ÉMISSION — AFFICHE GRAND FORMAT */}
      {config && dateEmission && (
        <section className="px-6 pb-16 max-w-6xl mx-auto w-full">
          <div className="relative rounded-3xl overflow-hidden border border-yellow-400/30">
            {/* Affiche ou fond dégradé */}
            {config.prochaine_emission_affiche_url ? (
              <div className="relative w-full aspect-video md:aspect-[16/7]">
                <Image
                  src={config.prochaine_emission_affiche_url}
                  alt="Affiche prochaine émission"
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
              </div>
            ) : (
              <div className="w-full aspect-video md:aspect-[16/7] bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-purple-900/30" />
            )}

            {/* Contenu superposé */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-center md:text-left">
              <div className="inline-block self-center md:self-start bg-red-500 text-white font-bold text-xs px-4 py-1.5 rounded-full mb-4 animate-pulse">
                🔴 PROCHAINE ÉMISSION
              </div>

              <h2 className="text-2xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
                {dateFormatee}
              </h2>

              {config.prochaine_emission_theme && (
                <p className="text-white/90 text-base md:text-xl max-w-3xl mb-2">
                  <strong className="text-yellow-400">Thème :</strong>{" "}
                  {config.prochaine_emission_theme}
                </p>
              )}

              {config.prochaine_emission_invites && (
                <p className="text-white/70 text-sm md:text-base max-w-3xl mb-6">
                  {config.prochaine_emission_invites}
                </p>
              )}

              {/* COMPTE À REBOURS */}
              <div className="grid grid-cols-4 gap-2 md:gap-3 max-w-lg mx-auto md:mx-0 mb-6">
                {[
                  { label: "JOURS", value: tempsRestant.jours },
                  { label: "HEURES", value: tempsRestant.heures },
                  { label: "MIN", value: tempsRestant.minutes },
                  { label: "SEC", value: tempsRestant.secondes },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-black/70 backdrop-blur border border-yellow-400/40 rounded-xl py-2 md:py-3"
                  >
                    <div className="text-xl md:text-3xl font-extrabold text-yellow-400">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] md:text-xs text-white/60 mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* BOUTONS */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href="/participer"
                  className="bg-yellow-400 text-black font-bold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-yellow-300 transition text-sm md:text-base"
                >
                  🎤 PARTICIPER À L&apos;ÉMISSION
                </Link>
                {config.prochaine_emission_lien_live && (
                  <a
                    href={config.prochaine_emission_lien_live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-500 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-red-600 transition text-sm md:text-base"
                  >
                    🔴 REJOINDRE LE LIVE
                  </a>
                )}
                <Link
                  href="/questions"
                  className="border-2 border-yellow-400 text-yellow-400 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-yellow-400 hover:text-black transition text-sm md:text-base"
                >
                  🗣️ POSER UNE QUESTION
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ÉVÉNEMENTS À VENIR */}
      {evenements.length > 0 && (
        <section className="px-6 py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-3">
                📅 À NE PAS MANQUER
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Prochains événements sur le campus
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {evenements.map((ev) => (
                <CarteEvenement key={ev.id} evenement={ev} compact />
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/actualites"
                className="inline-block border-2 border-yellow-400 text-yellow-400 font-bold px-8 py-3 rounded-full hover:bg-yellow-400 hover:text-black transition"
              >
                VOIR TOUS LES ÉVÉNEMENTS →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* RUBRIQUES */}
      <section className="px-6 py-16 border-t border-white/10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          🎬 Les rubriques de l&apos;émission
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {rubriques.map((rub) => (
            <Link
              key={rub.titre}
              href={rub.href}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:border-yellow-400/50 transition block"
            >
              <div className="text-3xl mb-2">{rub.emoji}</div>
              <div className="text-sm font-semibold">{rub.titre}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-white/10 text-center text-sm text-white/50">
        © {new Date().getFullYear()} Campus Vibes — USSEIN Fatick
        <br />
        <span className="text-yellow-400/80">
          Les étudiants, leurs voix, leurs histoires.
        </span>
        <div className="mt-4">
          <Link
            href="/admin"
            className="text-xs text-white/20 hover:text-yellow-400/60 transition"
          >
            🔐 Espace équipe
          </Link>
        </div>
      </footer>
    </main>
  );
}