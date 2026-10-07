import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
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
  );
}