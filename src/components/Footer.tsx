export default function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-white/10 text-center text-sm text-white/50 mt-auto">
      © {new Date().getFullYear()} Campus Vibes — USSEIN Fatick
      <br />
      <span className="text-yellow-400/80">
        Les étudiants, leurs voix, leurs histoires.
      </span>
    </footer>
  );
}