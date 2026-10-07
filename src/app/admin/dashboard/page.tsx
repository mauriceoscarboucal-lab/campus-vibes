"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Candidature = {
  id: string;
  prenom: string;
  nom: string;
  filiere: string;
  niveau: string;
  telephone: string;
  rubrique: string;
  motivation: string;
  presentation: string;
  statut: string;
  created_at: string;
};

type Question = {
  id: string;
  nom: string;
  anonyme: boolean;
  filiere: string;
  niveau: string;
  categorie: string;
  question: string;
  statut: string;
  created_at: string;
};

type Sujet = {
  id: string;
  prenom: string;
  nom: string;
  filiere: string;
  niveau: string;
  titre: string;
  description: string;
  statut: string;
  created_at: string;
};

type InscriptionJeu = {
  id: string;
  jeu: string;
  nom: string;
  filiere: string;
  niveau: string;
  telephone: string;
  statut: string;
  created_at: string;
};

type Talent = {
  id: string;
  prenom: string;
  nom: string;
  filiere: string;
  niveau: string;
  telephone: string;
  type_talent: string;
  description: string;
  lien_externe: string | null;
  statut: string;
  created_at: string;
};

type Onglet = "candidatures" | "questions" | "sujets" | "jeux" | "talents";
type Filtre = "tous" | "en_attente" | "selectionne" | "refuse";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [onglet, setOnglet] = useState<Onglet>("candidatures");
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [emailAdmin, setEmailAdmin] = useState("");
  const [nomAdmin, setNomAdmin] = useState("");
  const [roleAdmin, setRoleAdmin] = useState("");
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sujets, setSujets] = useState<Sujet[]>([]);
  const [jeux, setJeux] = useState<InscriptionJeu[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);

  useEffect(() => {
    verifierSession();
  }, []);

  async function verifierSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    router.push("/admin");
    return;
  }
  setEmailAdmin(data.session.user.email || "Admin");

  // Récupérer le profil (nom + rôle)
  const { data: profil } = await supabase
    .from("profils")
    .select("nom, prenom, role")
    .eq("id", data.session.user.id)
    .single();

  if (profil) {
    setNomAdmin(`${profil.prenom} ${profil.nom}`);
    setRoleAdmin(profil.role);
  }

  await chargerDonnees();
  setChargement(false);
}

  async function chargerDonnees() {
    const [c, q, s, j, t] = await Promise.all([
      supabase.from("candidatures").select("*").order("created_at", { ascending: false }),
      supabase.from("questions").select("*").order("created_at", { ascending: false }),
      supabase.from("sujets").select("*").order("created_at", { ascending: false }),
      supabase.from("inscriptions_jeux").select("*").order("created_at", { ascending: false }),
      supabase.from("talents").select("*").order("created_at", { ascending: false }),
    ]);
    setCandidatures(c.data || []);
    setQuestions(q.data || []);
    setSujets(s.data || []);
    setJeux(j.data || []);
    setTalents(t.data || []);
  }

  async function seDeconnecter() {
    await supabase.auth.signOut();
    router.push("/admin");
  }

  async function changerStatut(
    table: "candidatures" | "questions" | "sujets" | "inscriptions_jeux" | "talents",
    id: string,
    nouveauStatut: string
  ) {
    setActionEnCours(id);
    const { error } = await supabase.from(table).update({ statut: nouveauStatut }).eq("id", id);
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      await chargerDonnees();
    }
    setActionEnCours(null);
  }

  async function supprimer(
    table: "candidatures" | "questions" | "sujets" | "inscriptions_jeux" | "talents",
    id: string
  ) {
    if (!confirm("Supprimer définitivement cet élément ?")) return;
    setActionEnCours(id);
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      await chargerDonnees();
    }
    setActionEnCours(null);
  }

  if (chargement) {
    return (
      <main className="min-h-screen bg-[#0F0F1A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-white/60">Chargement...</p>
        </div>
      </main>
    );
  }

  const compteurs = {
    candidatures: candidatures.length,
    questions: questions.length,
    sujets: sujets.length,
    jeux: jeux.length,
    talents: talents.length,
  };

  const onglets: { id: Onglet; emoji: string; label: string; count: number }[] = [
    { id: "candidatures", emoji: "🎤", label: "Candidatures", count: compteurs.candidatures },
    { id: "questions", emoji: "🗣️", label: "Questions", count: compteurs.questions },
    { id: "sujets", emoji: "💡", label: "Sujets proposés", count: compteurs.sujets },
    { id: "jeux", emoji: "🎮", label: "Inscriptions jeux", count: compteurs.jeux },
    { id: "talents", emoji: "⭐", label: "Talents", count: compteurs.talents },
  ];

  function filtrerListe<T extends { statut: string }>(liste: T[]): T[] {
    if (filtre === "tous") return liste;
    return liste.filter((item) => item.statut === filtre);
  }

  function compterStatut(liste: { statut: string }[], statut: string) {
    return liste.filter((item) => item.statut === statut).length;
  }

  const listeActive =
    onglet === "candidatures"
      ? candidatures
      : onglet === "questions"
      ? questions
      : onglet === "sujets"
      ? sujets
      : onglet === "jeux"
      ? jeux
      : talents;

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white">
      {/* HEADER */}
      <header className="bg-black/40 border-b border-white/10 px-6 py-4 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🎙️</span>
            <span className="font-bold">CAMPUS VIBES — ADMIN</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm text-white/70 hidden md:block text-right leading-tight">
  <div>
    👋 Bonjour <strong className="text-yellow-400">{nomAdmin || emailAdmin}</strong>
  </div>
  <div className="text-xs text-white/50">
    {roleAdmin && <span className="uppercase font-bold text-yellow-400/70">{roleAdmin}</span>}
    {roleAdmin && " · "}
    {emailAdmin}
  </div>
</div>
            
<Link
  href="/admin/prochaine-emission"
  className="text-sm bg-orange-400/20 border border-orange-400/50 text-orange-300 px-4 py-2 rounded-full hover:bg-orange-400/30"
>
  📺 Prochaine
</Link>
<Link
  href="/admin/evenements"
  className="text-sm bg-blue-400/20 border border-blue-400/50 text-blue-300 px-4 py-2 rounded-full hover:bg-blue-400/30"
>
  📅 Événements
</Link>

<Link
  href="/admin/membres"
  className="text-sm bg-yellow-400/20 border border-yellow-400/50 text-yellow-300 px-4 py-2 rounded-full hover:bg-yellow-400/30"
>
  👥 Membres
</Link>
            <Link
              href="/"
              className="text-sm bg-white/5 border border-white/15 px-4 py-2 rounded-full hover:bg-white/10"
            >
              🌐 Voir le site
            </Link>
            <button
              onClick={() => chargerDonnees()}
              className="text-sm bg-white/5 border border-white/15 px-4 py-2 rounded-full hover:bg-white/10"
            >
              🔄 Rafraîchir
            </button>
            <button
              onClick={seDeconnecter}
              className="text-sm bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-full hover:bg-red-500/30"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Tableau de bord</h1>
        <p className="text-white/50 text-sm mb-8">
          Gère les contenus de Campus Vibes — tout ce qui arrive du site public
        </p>

        {/* ONGLETS */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {onglets.map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setOnglet(o.id);
                setFiltre("tous");
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm font-semibold transition ${
                onglet === o.id
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-white/5 border-white/15 text-white/80 hover:border-yellow-400/50"
              }`}
            >
              {o.emoji} {o.label}{" "}
              <span className="opacity-70">({o.count})</span>
            </button>
          ))}
        </div>

        {/* STATS + FILTRES */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Stat
                label="En attente"
                value={compterStatut(listeActive, "en_attente") + compterStatut(listeActive, "nouvelle") + compterStatut(listeActive, "nouveau")}
                couleur="yellow"
              />
              <Stat
                label="Sélectionnés"
                value={compterStatut(listeActive, "selectionne") + compterStatut(listeActive, "retenu")}
                couleur="green"
              />
              <Stat
                label="Refusés"
                value={compterStatut(listeActive, "refuse")}
                couleur="red"
              />
            </div>
            <div className="flex gap-2">
              {(["tous", "en_attente", "selectionne", "refuse"] as Filtre[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltre(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    filtre === f
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "bg-white/5 border-white/15 text-white/70 hover:border-yellow-400/50"
                  }`}
                >
                  {f === "tous" && "Tous"}
                  {f === "en_attente" && "En attente"}
                  {f === "selectionne" && "Sélectionnés"}
                  {f === "refuse" && "Refusés"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENU */}
        <div className="grid md:grid-cols-2 gap-4">
          {onglet === "candidatures" &&
            (filtrerListe(candidatures).length === 0 ? (
              <Vide />
            ) : (
              filtrerListe(candidatures).map((c) => (
                <Carte
                  key={c.id}
                  titre={`${c.prenom} ${c.nom}`}
                  meta={`${c.filiere} · ${c.niveau} · ${c.telephone}`}
                  statut={c.statut}
                >
                  <p className="text-sm text-white/70 mb-1">
                    <strong className="text-yellow-400">Rubrique :</strong> {c.rubrique}
                  </p>
                  <p className="text-sm text-white/70 mb-1">
                    <strong className="text-yellow-400">Motivation :</strong> {c.motivation}
                  </p>
                  <p className="text-sm text-white/60 italic mb-4">{c.presentation}</p>
                  <Actions
                    statut={c.statut}
                    chargement={actionEnCours === c.id}
                    peutModifier={roleAdmin === "admin" || roleAdmin === "editeur"}  
                    onSelect={() => changerStatut("candidatures", c.id, "selectionne")}
                    onRefuse={() => changerStatut("candidatures", c.id, "refuse")}
                    onDelete={() => supprimer("candidatures", c.id)}
                  />
                </Carte>
              ))
            ))}

          {onglet === "questions" &&
            (filtrerListe(questions).length === 0 ? (
              <Vide />
            ) : (
              filtrerListe(questions).map((q) => (
                <Carte
                  key={q.id}
                  titre={q.nom}
                  meta={`${q.filiere} · ${q.niveau} · ${q.categorie}`}
                  statut={q.statut}
                >
                  {q.anonyme && (
                    <span className="inline-block text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full mb-2">
                      Anonyme à l&apos;écran
                    </span>
                  )}
                  <p className="text-sm text-white/80 mb-4">{q.question}</p>
                  <Actions
                    statut={q.statut}
                    chargement={actionEnCours === q.id}
                    peutModifier={roleAdmin === "admin" || roleAdmin === "editeur"}  
                    onSelect={() => changerStatut("questions", q.id, "selectionne")}
                    onRefuse={() => changerStatut("questions", q.id, "refuse")}
                    onDelete={() => supprimer("questions", q.id)}
                  />
                </Carte>
              ))
            ))}

          {onglet === "sujets" &&
            (filtrerListe(sujets).length === 0 ? (
              <Vide />
            ) : (
              filtrerListe(sujets).map((s) => (
                <Carte
                  key={s.id}
                  titre={s.titre}
                  meta={`Proposé par ${s.prenom} ${s.nom} · ${s.filiere} ${s.niveau}`}
                  statut={s.statut}
                >
                  <p className="text-sm text-white/70 mb-4">{s.description}</p>
                  <Actions
                    statut={s.statut}
                    chargement={actionEnCours === s.id}
                    peutModifier={roleAdmin === "admin" || roleAdmin === "editeur"}  
                    onSelect={() => changerStatut("sujets", s.id, "selectionne")}
                    onRefuse={() => changerStatut("sujets", s.id, "refuse")}
                    onDelete={() => supprimer("sujets", s.id)}
                  />
                </Carte>
              ))
            ))}

          {onglet === "jeux" &&
            (filtrerListe(jeux).length === 0 ? (
              <Vide />
            ) : (
              filtrerListe(jeux).map((j) => (
                <Carte
                  key={j.id}
                  titre={j.nom}
                  meta={`${j.filiere} · ${j.niveau} · ${j.telephone}`}
                  statut={j.statut}
                >
                  <p className="text-sm text-yellow-400 font-semibold mb-4">🎯 {j.jeu}</p>
                  <Actions
                    statut={j.statut}
                    chargement={actionEnCours === j.id}
                    peutModifier={roleAdmin === "admin" || roleAdmin === "editeur"}  
                    onSelect={() => changerStatut("inscriptions_jeux", j.id, "selectionne")}
                    onRefuse={() => changerStatut("inscriptions_jeux", j.id, "refuse")}
                    onDelete={() => supprimer("inscriptions_jeux", j.id)}
                  />
                </Carte>
              ))
            ))}

          {onglet === "talents" &&
            (filtrerListe(talents).length === 0 ? (
              <Vide />
            ) : (
              filtrerListe(talents).map((t) => (
                <Carte
                  key={t.id}
                  titre={`${t.prenom} ${t.nom}`}
                  meta={`${t.filiere} · ${t.niveau} · ${t.telephone}`}
                  statut={t.statut}
                >
                  <p className="text-sm text-yellow-400 font-semibold mb-1">
                    🎭 {t.type_talent}
                  </p>
                  <p className="text-sm text-white/70 mb-2">{t.description}</p>
                  {t.lien_externe && (
                    <a
                      href={t.lien_externe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline mb-3 inline-block"
                    >
                      🔗 Voir son travail
                    </a>
                  )}
                  <Actions
                    statut={t.statut}
                    chargement={actionEnCours === t.id}
                    peutModifier={roleAdmin === "admin" || roleAdmin === "editeur"}  
                    onSelect={() => changerStatut("talents", t.id, "selectionne")}
                    onRefuse={() => changerStatut("talents", t.id, "refuse")}
                    onDelete={() => supprimer("talents", t.id)}
                  />
                </Carte>
              ))
            ))}
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  couleur,
}: {
  label: string;
  value: number;
  couleur: "yellow" | "green" | "red";
}) {
  const couleurs = {
    yellow: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
    green: "bg-green-400/20 text-green-300 border-green-400/30",
    red: "bg-red-400/20 text-red-300 border-red-400/30",
  };
  return (
    <div className={`border rounded-xl px-4 py-2 text-center ${couleurs[couleur]}`}>
      <div className="text-2xl font-extrabold leading-none">{value}</div>
      <div className="text-xs opacity-80 mt-1">{label}</div>
    </div>
  );
}

function Carte({
  titre,
  meta,
  statut,
  children,
}: {
  titre: string;
  meta: string;
  statut: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight mb-1">{titre}</h3>
          <p className="text-xs text-white/50">{meta}</p>
        </div>
        <Badge statut={statut} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Badge({ statut }: { statut: string }) {
  const couleurs: Record<string, string> = {
    en_attente: "bg-yellow-400/20 text-yellow-300",
    nouvelle: "bg-blue-400/20 text-blue-300",
    nouveau: "bg-blue-400/20 text-blue-300",
    selectionne: "bg-green-400/20 text-green-300",
    retenu: "bg-green-400/20 text-green-300",
    refuse: "bg-red-400/20 text-red-300",
    traitee: "bg-gray-400/20 text-gray-300",
  };
  const couleur = couleurs[statut] || "bg-white/10 text-white/60";
  return (
    <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${couleur}`}>
      {statut.replace("_", " ")}
    </span>
  );
}

function Actions({
  statut,
  chargement,
  onSelect,
  onRefuse,
  onDelete,
  peutModifier,
}: {
  statut: string;
  chargement: boolean;
  onSelect: () => void;
  onRefuse: () => void;
  onDelete: () => void;
  peutModifier: boolean;
}) {
  if (!peutModifier) {
    return (
      <div className="pt-3 border-t border-white/10 text-xs text-white/40 text-center">
        👁️ Lecture seule — contactez un administrateur pour modifier
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap pt-3 border-t border-white/10">
      <button
        onClick={onSelect}
        disabled={chargement || statut === "selectionne" || statut === "retenu"}
        className="flex-1 text-xs bg-green-500/20 border border-green-500/50 text-green-300 px-3 py-2 rounded-full hover:bg-green-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ✅ Sélectionner
      </button>
      <button
        onClick={onRefuse}
        disabled={chargement || statut === "refuse"}
        className="flex-1 text-xs bg-red-500/20 border border-red-500/50 text-red-300 px-3 py-2 rounded-full hover:bg-red-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ❌ Refuser
      </button>
      <button
        onClick={onDelete}
        disabled={chargement}
        className="text-xs bg-white/5 border border-white/15 px-3 py-2 rounded-full hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition disabled:opacity-30"
      >
        🗑️
      </button>
    </div>
  );
}

function Vide() {
  return (
    <div className="col-span-full text-center py-12 text-white/40">
      <div className="text-4xl mb-3">📭</div>
      Aucun élément dans cette catégorie.
    </div>
  );
}