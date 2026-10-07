"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profil = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  created_at: string;
};

const roles = [
  { value: "admin", label: "👑 Admin", description: "Peut tout faire" },
  { value: "editeur", label: "✏️ Éditeur", description: "Peut gérer les contenus" },
  { value: "lecteur", label: "👁️ Lecteur", description: "Consultation seule" },
];

export default function MembresPage() {
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [monProfil, setMonProfil] = useState<Profil | null>(null);
  const [membres, setMembres] = useState<Profil[]>([]);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  // Formulaire nouveau membre
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formPrenom, setFormPrenom] = useState("");
  const [formNom, setFormNom] = useState("");
  const [formRole, setFormRole] = useState("lecteur");
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

    // Vérifier que c'est un admin
    const { data: profil } = await supabase
      .from("profils")
      .select("*")
      .eq("id", data.session.user.id)
      .single();

    if (!profil || profil.role !== "admin") {
      router.push("/admin/dashboard");
      return;
    }

    setMonProfil(profil);
    await chargerMembres();
    setChargement(false);
  }

  async function chargerMembres() {
    const { data } = await supabase
      .from("profils")
      .select("*")
      .order("created_at", { ascending: true });
    setMembres(data || []);
  }

async function ajouterMembre(e: React.FormEvent) {
  e.preventDefault();
  setFormChargement(true);
  setFormErreur(null);

  // Sauvegarder la session admin actuelle
  const { data: sessionActuelle } = await supabase.auth.getSession();

  // 1. Créer l'utilisateur (signUp va nous déconnecter temporairement)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formEmail,
    password: formPassword,
  });

  if (authError || !authData.user) {
    setFormErreur("Erreur : " + (authError?.message || "Impossible de créer l'utilisateur"));
    setFormChargement(false);
    return;
  }

  // 🔄 IMPORTANT : Se reconnecter en admin avant d'insérer dans la table profils
  if (sessionActuelle.session) {
    await supabase.auth.setSession({
      access_token: sessionActuelle.session.access_token,
      refresh_token: sessionActuelle.session.refresh_token,
    });
  }

  // 2. Créer le profil via la fonction RPC sécurisée
  const { error: profilError } = await supabase.rpc("creer_profil", {
    p_id: authData.user.id,
    p_email: formEmail,
    p_prenom: formPrenom,
    p_nom: formNom,
    p_role: formRole,
  });

  if (profilError) {
    setFormErreur("Utilisateur créé mais erreur profil : " + profilError.message);
    setFormChargement(false);
    return;
  }

  // Reset
  setFormEmail("");
  setFormPassword("");
  setFormPrenom("");
  setFormNom("");
  setFormRole("lecteur");
  setModalOuvert(false);
  setFormChargement(false);
  await chargerMembres();

  alert("✅ Membre ajouté avec succès ! Il/elle peut maintenant se connecter sur /admin");
}

  async function changerRole(id: string, nouveauRole: string) {
    if (id === monProfil?.id) {
      alert("⚠️ Tu ne peux pas changer ton propre rôle !");
      return;
    }
    setActionEnCours(id);
    const { error } = await supabase.from("profils").update({ role: nouveauRole }).eq("id", id);
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      await chargerMembres();
    }
    setActionEnCours(null);
  }

  async function supprimerMembre(id: string) {
    if (id === monProfil?.id) {
      alert("⚠️ Tu ne peux pas te supprimer toi-même !");
      return;
    }
    if (!confirm("Supprimer définitivement ce membre ? Il ne pourra plus se connecter.")) return;
    setActionEnCours(id);
    const { error } = await supabase.from("profils").delete().eq("id", id);
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      await chargerMembres();
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
            <Link
              href="/"
              className="text-sm bg-white/5 border border-white/15 px-4 py-2 rounded-full hover:bg-white/10"
            >
              🌐 Voir le site
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
              👥 Gestion des membres
            </h1>
            <p className="text-white/50 text-sm">
              Ajoute, modifie et supprime les membres de l&apos;équipe Campus Vibes
            </p>
          </div>
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition"
          >
            ➕ Ajouter un membre
          </button>
        </div>

        {/* LISTE DES MEMBRES */}
        <div className="space-y-4">
          {membres.map((m) => (
            <div
              key={m.id}
              className={`bg-white/5 border rounded-2xl p-5 ${
                m.id === monProfil?.id
                  ? "border-yellow-400/50"
                  : "border-white/10"
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-lg">
                      {m.prenom} {m.nom}
                    </h3>
                    {m.id === monProfil?.id && (
                      <span className="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">
                        Toi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mb-3">{m.email}</p>

                  <div className="flex gap-2 flex-wrap">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => changerRole(m.id, r.value)}
                        disabled={
                          actionEnCours === m.id ||
                          m.id === monProfil?.id
                        }
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${
                          m.role === r.value
                            ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                            : "bg-white/5 border-white/15 text-white/70 hover:border-yellow-400/50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => supprimerMembre(m.id)}
                  disabled={actionEnCours === m.id || m.id === monProfil?.id}
                  className="text-sm bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-full hover:bg-red-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* LÉGENDE DES RÔLES */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold mb-3 text-sm uppercase tracking-widest text-white/60">
            📖 Légende des rôles
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {roles.map((r) => (
              <div key={r.value}>
                <div className="font-bold mb-1">{r.label}</div>
                <div className="text-white/60 text-xs">{r.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL AJOUT MEMBRE */}
      {modalOuvert && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => !formChargement && setModalOuvert(false)}
        >
          <div
            className="bg-[#1A1A2E] border border-white/15 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold mb-1">➕ Nouveau membre</h3>
                <p className="text-xs text-white/50">
                  Le membre pourra se connecter immédiatement
                </p>
              </div>
              <button
                onClick={() => setModalOuvert(false)}
                disabled={formChargement}
                className="text-white/60 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={ajouterMembre} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formPrenom}
                  onChange={(e) => setFormPrenom(e.target.value)}
                  placeholder="Prénom *"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  placeholder="Nom *"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Email *"
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />

              <input
                type="text"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Mot de passe (min 6 caractères) *"
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none"
              />

              <div>
                <label className="block text-sm font-semibold mb-2">Rôle</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormRole(r.value)}
                      className={`py-2 rounded-xl border text-xs font-semibold transition ${
                        formRole === r.value
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : "bg-white/5 border-white/15 text-white/70 hover:border-yellow-400/50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

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
                {formChargement ? "CRÉATION..." : "CRÉER LE MEMBRE"}
              </button>

              <p className="text-xs text-white/40 text-center">
                Communique l&apos;email et le mot de passe au membre
                <br />
                Il pourra se connecter sur <strong>/admin</strong>
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}