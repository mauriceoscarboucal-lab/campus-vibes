import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Liste des émissions (sera gérée via l'admin plus tard)
const emissions = [
  {
    id: 12,
    numero: "#12",
    date: "Jeudi 9 Octobre 2026",
    theme: "Vivre sur le campus : entre galères et bons plans",
    invites: "Avec Aïssatou D., Modou S. et le club Éco",
    videoUrl: "https://youtube.com",
    miniature: "🎓",
    couleur: "from-purple-500 to-pink-500",
  },
  {
    id: 11,
    numero: "#11",
    date: "Jeudi 2 Octobre 2026",
    theme: "La place des femmes dans les filières scientifiques",
    invites: "Avec Dr. Ndiaye et l'association Wom'en Tech",
    videoUrl: "https://youtube.com",
    miniature: "🔬",
    couleur: "from-blue-500 to-cyan-500",
  },
  {
    id: 10,
    numero: "#10",
    date: "Jeudi 25 Septembre 2026",
    theme: "Étudier avec 0 FCFA : bourses, aides et débrouilles",
    invites: "Avec le service social USSEIN",
    videoUrl: "https://youtube.com",
    miniature: "💰",
    couleur: "from-yellow-500 to-orange-500",
  },
  {
    id: 9,
    numero: "#9",
    date: "Jeudi 18 Septembre 2026",
    theme: "Sport universitaire : pourquoi si peu d'engouement ?",
    invites: "Avec l'équipe de foot du campus",
    videoUrl: "https://youtube.com",
    miniature: "⚽",
    couleur: "from-green-500 to-emerald-500",
  },
  {
    id: 8,
    numero: "#8",
    date: "Jeudi 11 Septembre 2026",
    theme: "Retour sur la rentrée : ce qui a changé cette année",
    invites: "Avec le bureau des étudiants",
    videoUrl: "https://youtube.com",
    miniature: "🎒",
    couleur: "from-red-500 to-rose-500",
  },
  {
    id: 7,
    numero: "#7",
    date: "Jeudi 4 Septembre 2026",
    theme: "Nos talents cachés : slam, danse, code et musique",
    invites: "Avec 4 étudiants talentueux",
    videoUrl: "https://youtube.com",
    miniature: "⭐",
    couleur: "from-indigo-500 to-violet-500",
  },
];

export default function EmissionsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0F0F1A] text-white">
      <Header />

      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <p className="text-yellow-400 font-semibold tracking-widest text-sm mb-3 text-center">
          📺 NOS ÉMISSIONS
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-4">
          Toutes les émissions
        </h1>
        <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
          Retrouve tous les épisodes de Campus Vibes. Regarde, revise, partage !
        </p>

        {/* PROCHAINE ÉMISSION — Bannière */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 mb-12 text-black">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-bold text-sm uppercase tracking-widest mb-2 opacity-80">
                🔴 Prochaine émission
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
                Jeudi 15 Octobre — 18H00
              </h2>
              <p className="text-black/80 max-w-lg">
                Thème : <strong>La vie associative sur le campus : moteur ou frein ?</strong>
                <br />
                Avec des invités surprises et un plateau 100% étudiant.
              </p>
            </div>
            <div className="bg-black text-yellow-400 font-bold px-8 py-4 rounded-full hover:bg-black/80 transition cursor-pointer whitespace-nowrap">
              🔔 ME RAPPELER
            </div>
          </div>
        </div>

        {/* GRILLE DES ÉMISSIONS PASSÉES */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span>🗂️</span> Épisodes précédents
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emissions.map((em) => (
            <div
              key={em.id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition flex flex-col group"
            >
              {/* Miniature */}
              <div
                className={`bg-gradient-to-br ${em.couleur} h-44 flex items-center justify-center text-7xl relative`}
              >
                {em.miniature}
                <span className="absolute top-3 left-3 bg-black/60 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                  {em.numero}
                </span>
              </div>

              {/* Contenu */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-xs text-white/50 mb-2">{em.date}</p>
                <h3 className="text-lg font-bold mb-2 leading-snug">
                  {em.theme}
                </h3>
                <p className="text-sm text-white/60 mb-4">{em.invites}</p>

                <a
                  href={em.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full bg-yellow-400 text-black font-bold py-3 rounded-full hover:bg-yellow-300 transition text-center text-sm"
                >
                  ▶ REGARDER LE REPLAY
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}