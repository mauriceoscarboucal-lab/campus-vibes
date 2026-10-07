"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Config = {
  id: number;
  prochaine_emission_date: string | null;
  prochaine_emission_theme: string | null;
  prochaine_emission_invites: string | null;
  prochaine_emission_affiche_url: string | null;
  prochaine_emission_lien_live: string | null;
};

type Profil = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
};

export default function ProchaineEmissionPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [monProfil, setMonProfil] = useState<Profil | null>(null);

  const [formDate, setFormDate] = useState("");
  const [formTheme, setFormTheme] = useState("");
  const [formInvites, setFormInvites] = useState("");
  const [formLien, setFormLien] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [afficheActuelle, setAfficheActuelle] = useState<string | null>(null);

  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

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
    await chargerConfig();
    setChargement(false);
  }

  async function chargerConfig() {
    const { data } = await supabase.from("config").select("*").eq("id", 1).single();
    if (data) {
      if (data.prochaine_emission_date) {
        const d = new Date(data.prochaine_emission_date);
        setFormDate(d.toISOString().slice(0, 16));
      }
      setFormTheme(data.prochaine_emission_theme || "");
      setFormInvites(data.prochaine_emission_invites || "");
      setFormLien(data.prochaine_emission_lien_live || "");
      setAfficheActuelle(data.prochaine_emission_affiche_url);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setErreur(null);
    setSucces(false);

    let afficheUrl = afficheActuelle;

    // Si nouvelle image → upload
    if (formImage) {
      const ext = formImage.name.split(".").pop();
      const nomFichier = `prochaine-emission-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("affiches")
        .upload(nomFichier, formImage, { upsert: true });

      if (uploadError) {
        setErreur("Erreur upload affiche : " + uploadError.message);
        setEnregistrement(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("affiches")
        .getPublicUrl(nomFichier);

      afficheUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("config")
      .update({
        prochaine_emission_date: new Date(formDate).toISOString(),
        prochaine_emission_theme: formTheme,
        prochaine_emission_invites: formInvites || null,
        prochaine_emission_affiche_url: afficheUrl,
        prochaine_emission_lien_live: formLien || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      setErreur("Erreur : " + error.message);
      setEnregistrement(false);
      return;
    }

    setAfficheActuelle(afficheUrl);
    setFormImage(null);
    setSucces(true);
    setEnregistrement(false);

    setTimeout(() => setSucces(false), 3000);
  }

  async function supprimerAffiche() {
    if (!confirm("Supprimer l'affiche actuelle ?")) return;
    setAfficheActuelle(null);

    await supabase
      .from("config")
      .update({ prochaine_emission_affiche_url: null })
      .eq("id", 1);
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
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            📺 Prochaine émission
          </h1>
          <p className="text-white/50 text-sm">
            Configure ce qui s&apos;affiche sur la page d&apos;accueil en grand
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DATE */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-bold mb-3 text-yellow-400 uppercase tracking-widest">
              📅 Date et heure de l&apos;émission *
            </label>
            <input
              type="datetime-local"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
            />
            <p className="text-xs text-white/50 mt-2">
              Le compte à rebours s&apos;affichera automatiquement sur l&apos;accueil.
            </p>
          </div>

          {/* THEME */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-bold mb-3 text-yellow-400 uppercase tracking-widest">
              🎤 Thème de l&apos;émission *
            </label>
            <input
              type="text"
              value={formTheme}
              onChange={(e) => setFormTheme(e.target.value)}
              required
              placeholder="Ex: La vie associative sur le campus"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* INVITES */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-bold mb-3 text-yellow-400 uppercase tracking-widest">
              👥 Invités (optionnel)
            </label>
            <textarea
              value={formInvites}
              onChange={(e) => setFormInvites(e.target.value)}
              rows={2}
              placeholder="Ex: Avec Dr. Ndiaye et le club Éco"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* LIEN LIVE */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-bold mb-3 text-yellow-400 uppercase tracking-widest">
              🔴 Lien du live (optionnel)
            </label>
            <input
              type="url"
              value={formLien}
              onChange={(e) => setFormLien(e.target.value)}
              placeholder="https://youtube.com/live/..."
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
            />
            <p className="text-xs text-white/50 mt-2">
              Si rempli, un bouton &quot;REJOINDRE LE LIVE&quot; s&apos;affichera sur l&apos;accueil.
            </p>
          </div>

          {/* AFFICHE */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-bold mb-3 text-yellow-400 uppercase tracking-widest">
              🖼️ Affiche de l&apos;émission (optionnel)
            </label>
            <p className="text-xs text-white/50 mb-4">
              Format recommandé : <strong>paysage 16:9</strong> (ex: 1200×675 px).
              Si tu ne mets pas d&apos;affiche, un fond dégradé s&apos;affichera automatiquement.
            </p>

            {afficheActuelle && !formImage && (
              <div className="mb-4 relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/15">
                <Image
                  src={afficheActuelle}
                  alt="Affiche actuelle"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={supprimerAffiche}
                  className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-3 py-2 rounded-full hover:bg-red-500"
                >
                  🗑️ Retirer
                </button>
              </div>
            )}

            {formImage && (
              <div className="mb-4 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3">
                📎 Nouvelle image prête : <strong>{formImage.name}</strong> — clique
                sur Enregistrer pour valider
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormImage(e.target.files?.[0] || null)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-400 file:text-black file:font-bold file:cursor-pointer hover:file:bg-yellow-300"
            />
          </div>

          {/* MESSAGES */}
          {erreur && (
            <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-sm">
              ⚠️ {erreur}
            </div>
          )}

          {succes && (
            <div className="bg-green-500/10 border border-green-500 rounded-xl p-4 text-green-400 text-sm">
              ✅ Modifications enregistrées ! Elles sont visibles sur la page d&apos;accueil.
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={enregistrement}
            className="w-full bg-yellow-400 text-black font-bold py-4 rounded-full hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {enregistrement ? "ENREGISTREMENT..." : "💾 ENREGISTRER LES MODIFICATIONS"}
          </button>
        </form>

        {/* PREVIEW */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
            👁️ Aperçu du lien vers le site
          </h3>
          <Link
            href="/"
            target="_blank"
            className="text-yellow-400 hover:underline text-sm"
          >
            → Voir la page d&apos;accueil dans un nouvel onglet
          </Link>
        </div>
      </div>
    </main>
  );
}