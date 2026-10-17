export default function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-gray-200 bg-green-50 text-center text-sm text-gray-600 mt-auto">
      © {new Date().getFullYear()} Campus Vibes — USSEIN Fatick
      <br />
      <span className="text-green-700 font-bold">
        Les étudiants, leurs voix, leurs histoires.
      </span>
    </footer>
  );
}