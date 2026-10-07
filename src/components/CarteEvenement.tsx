import Image from "next/image";

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

const couleursCategories: Record<string, string> = {
  "Émission": "bg-yellow-400 text-black",
  "Conférence": "bg-purple-500 text-white",
  "Sport": "bg-green-500 text-white",
  "Culture": "bg-pink-500 text-white",
  "Concours": "bg-orange-500 text-white",
  "Atelier": "bg-indigo-500 text-white",
  "Assemblée": "bg-blue-500 text-white",
  "Autre": "bg-gray-500 text-white",
};

export default function CarteEvenement({
  evenement,
  compact = false,
}: {
  evenement: Evenement;
  compact?: boolean;
}) {
  const dateObj = new Date(evenement.date_event);

  const jour = dateObj.toLocaleDateString("fr-FR", { day: "2-digit" });
  const mois = dateObj
    .toLocaleDateString("fr-FR", { month: "short" })
    .toUpperCase()
    .replace(".", "");
  const heure = dateObj.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateComplete = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const couleur = couleursCategories[evenement.categorie] || "bg-gray-500 text-white";

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition flex flex-col">
      {/* Affiche */}
      {evenement.affiche_url ? (
        <div className={`relative w-full ${compact ? "h-40" : "h-56"} bg-black/40`}>
          <Image
            src={evenement.affiche_url}
            alt={evenement.titre}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div
          className={`bg-gradient-to-br from-yellow-400 to-orange-500 ${
            compact ? "h-40" : "h-56"
          } flex items-center justify-center text-7xl`}
        >
          📅
        </div>
      )}

      {/* Contenu */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${couleur}`}>
            {evenement.categorie}
          </span>
        </div>

        {/* Date (bloc carré) */}
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-yellow-400 text-black rounded-xl w-16 h-16 flex flex-col items-center justify-center shrink-0 font-bold">
            <div className="text-xl leading-none">{jour}</div>
            <div className="text-xs tracking-widest">{mois}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 mb-1">
              🕐 {heure} · 📍 {evenement.lieu}
            </p>
            <h3 className="text-base font-bold leading-tight">
              {evenement.titre}
            </h3>
          </div>
        </div>

        {!compact && (
          <p className="text-sm text-white/70 mb-4 line-clamp-3">
            {evenement.description}
          </p>
        )}

        {compact && (
          <p className="text-xs text-white/50 mb-4 capitalize">{dateComplete}</p>
        )}

        {evenement.lien_externe && (
          <a
            href={evenement.lien_externe}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto text-xs text-blue-400 hover:underline"
          >
            🔗 En savoir plus
          </a>
        )}
      </div>
    </div>
  );
}