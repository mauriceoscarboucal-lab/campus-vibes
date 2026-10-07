"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Evenement = {
  id: string;
  titre: string;
  description: string;
  date_event: string;
  lieu: string;
  categorie: string;
  affiche_url: string | null;
  lien_externe: string | null;
  created_at: string;
};

type Profil = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
};

const categories = [
  "Émission",
  "Conférence",
  "Sport",
  "Culture",
  "Concours",
  "Atelier",
  "Assemblée",
  "Autre",
];

export default function EvenementsAdminPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [monProfil, setMonProfil] = useState<Profil | null>(null);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [editionEnCours, setEditionEnCours] = useState<Evenement | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  // Formulaire
  const [formTitre, setFormTitre] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLieu, setFormLieu] = useState("");
  const [formCategorie, setFormCategorie] = useState("Émission");
  const [formLien, setFormLien] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formErreur, setFormErreur] = useState<string | null>(null);
  const [formChargement, setFormChargement] = useState(false);

  useEffect(() => {
    verifier();
  }, []);

  async function verifier() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/admin");
      return;
    }

    const { data: profil } = await supabase
      .from("profils")
      .select("*")
      .eq("id", data.session.user.id)
      .single();

    if (!profil || (profil.role !== "admin" && profil.role !== "editeur")) {
      router.push("/admin/dashboard");
      return;
    }

    setMonProfil(profil);
    await chargerEvenements();
    setChargement(false);
  }

  async function chargerEvenements() {
    const { data } = await supabase
      .from("evenements")
      .select("*")
      .order("date_event", { ascending: true });
    setEvenements(data || []);
  }

  function ouvrirCreation() {
    setEditionEnCours(null);
    setFormTitre("");
    setFormDescription("");
    setFormDate("");
    setFormLieu("");
    setFormCategorie("Émission");
    setFormLien("");
    setFormImage(null);
    setFormErreur(null);
    setModalOuvert(true);
  }

  function ouvrirEdition(ev: Evenement) {
    setEditionEnCours(ev);
    setFormTitre(ev.titre);
    setFormDescription(ev.description);
    // Format datetime-local : YYYY-MM-DDTHH:mm
    const d = new Date(ev.date_event);
    const iso = d.toISOString().slice(0, 16);
    setFormDate(iso);
    setFormLieu(ev.lieu);
    setFormCategorie(ev.categorie);
    setFormLien(ev.lien_externe || "");
    setFormImage(null);
    setFormErreur(null);
    setModalOuvert(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormChargement(true);
    setFormErreur(null);

    let afficheUrl = editionEnCours?.affiche_url || null;

    // Upload de l'affiche si nouveau fichier
    if (formImage) {
      const ext = formImage.name.split(".").pop();
      const nomFichier = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("affiches")
        .upload(nomFichier, formImage);

      if (uploadError) {
        setFormErreur("Erreur upload image : " + uploadError.message);
        setFormChargement(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("affiches")
        .getPublicUrl(nomFichier);

      afficheUrl = urlData.publicUrl;
    }

    const payload = {
      titre: formTitre,
      description: formDescription,
      date_event: new Date(formDate).toISOString(),
      lieu: formLieu,
      categorie: formCategorie,
      affiche_url: afficheUrl,
      lien_externe: formLien || null,
    };

    if (editionEnCours) {
      const { error } = await supabase
        .from("evenements")
        .update(payload)
        .eq("id", editionEnCours.id);
      if (error) {
        setFormErreur("Erreur : " + error.message);
        setFormChargement(false);
        return;
      }
    } else {
      const { error } = await supabase.from("evenements").insert(payload);
      if (error) {
        setFormErreur("Erreur : " + error.message);
        setFormChargement(false);
        return;
      }
    }

    setModalOuvert(false);
    setFormChargement(false);
    await chargerEvenements();
  }

  async function supprimer(id: string) {
    if (!confirm("Supprimer définitivement cet événement ?")) return;
    setActionEnCours(id);
    const { error } = await supabase.from("evenements").delete().eq("id", id);
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      await chargerEvenements();
    }
    setActionEnCours(null);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  return (
    <main className="min-h-screen bg-[#0F0F1A] text-white">
      <header className="bg-black/40 border-b border-white/10 px-6 py-4 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🎙️</span>
            <span className="font-bold">CAMPUS VIBES — ADMIN</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            {monProfil && (
              <div className="text-sm text-white/70 hidden md:block text-right leading-tight">
                <div>
                  👋 Bonjour{" "}
                  <strong className="text-yellow-400">
                    {monProfil.prenom} {monProfil.nom}
                  </strong>
                </div>
                <div className="text-xs text-white/50">
                  <span className="uppercase font-bold text-yellow-400/70">
                    {monProfil.role}
                  </span>{" "}
                  · {monProfil.email}
                </div>
              </div>
            )}
            <Link
              href="/admin/dashboard"
              className="text-sm bg-white/5 border border-white/15 px-4 py-2 rounded-full hover:bg-white/10"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
              📅 Gestion des événements
            </h1>
            <p className="text-white/50 text-sm">
              Crée et publie les événements du campus — ils apparaîtront sur le site public
            </p>
          </div>
          <button
            onClick={ouvrirCreation}
            className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition"
          >
            ➕ Nouvel événement
          </button>
        </div>

        {evenements.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <div className="text-5xl mb-4">📭</div>
            <p className="mb-2">Aucun événement pour l&apos;instant.</p>
            <p className="text-sm">Clique sur &quot;➕ Nouvel événement&quot; pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evenements.map((ev) => (
              <div
                key={ev.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-5"
              >
                {ev.affiche_url && (
                  <div className="relative w-full md:w-40 h-32 md:h-40 rounded-xl overflow-hidden shrink-0 bg-black/40">
                    <Image
                      src={ev.affiche_url}
                      alt={ev.titre}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap mb-2">
                    <span className="text-xs bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full font-semibold">
                      {ev.categorie}
                    </span>
                    <span className="text-xs text-white/50">
                      📅 {formatDate(ev.date_event)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{ev.titre}</h3>
                  <p className="text-sm text-white/60 mb-1">📍 {ev.lieu}</p>
                  <p className="text-sm text-white/70 mb-3">{ev.description}</p>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => ouvrirEdition(ev)}
                      className="text-xs bg-white/5 border border-white/15 px-4 py-2 rounded-full hover:bg-white/10"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => supprimer(ev.id)}
                      disabled={actionEnCours === ev.id}
                      className="text-xs bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-full hover:bg-red-500/30 disabled:opacity-50"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CREATION/EDITION */}
      {modalOuvert && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => !formChargement && setModalOuvert(false)}
        >
          <div
            className="bg-[#1A1A2E] border border-white/15 rounded-2xl p-6 max-w-lg w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <h3 className="text-xl font-bold">
                {editionEnCours ? "✏️ Modifier l'événement" : "➕ Nouvel événement"}
              </h3>
              <button
                onClick={() => setModalOuvert(false)}
                disabled={formChargement}
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={formTitre}
                onChange={(e) => setFormTitre(e.target.value)}
                placeholder="Titre de l'événement *"
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />

              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description *"
                required
                rows={3}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={formLieu}
                  onChange={(e) => setFormLieu(e.target.value)}
                  placeholder="Lieu *"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Catégorie *</label>
                <select
                  value={formCategorie}
                  onChange={(e) => setFormCategorie(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#0F0F1A]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Affiche (image, optionnel)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormImage(e.target.files?.[0] || null)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-400 file:text-black file:font-bold file:cursor-pointer hover:file:bg-yellow-300"
                />
                {editionEnCours?.affiche_url && !formImage && (
                  <p className="text-xs text-white/40 mt-2">
                    Une affiche existe déjà — laisse vide pour la conserver
                  </p>
                )}
              </div>

              <input
                type="url"
                value={formLien}
                onChange={(e) => setFormLien(e.target.value)}
                placeholder="Lien externe (Facebook, site... optionnel)"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />

              {formErreur && (
                <div className="bg-red-500/10 border border-red-500 rounded-xl p-3 text-red-400 text-sm">
                  ⚠️ {formErreur}
                </div>
              )}

              <button
                type="submit"
                disabled={formChargement}
                className="w-full bg-yellow-400 text-black font-bold py-3 rounded-full hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {formChargement
                  ? "ENREGISTREMENT..."
                  : editionEnCours
                  ? "METTRE À JOUR"
                  : "PUBLIER L'ÉVÉNEMENT"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}