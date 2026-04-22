import Link from 'next/link';
import { Siren } from 'lucide-react';
import { Logo } from './Logo';
import { LoginButton } from './LoginButton';
import { LanguageCurrencySwitcher } from './LanguageCurrencySwitcher';

export function Header() {
  return (
    <>
      <div className="w-full bg-brand-navy text-white text-xs md:text-sm py-2 px-4 text-center">
        Rejoignez notre chaîne WhatsApp pour rester informé des alertes en temps réel.
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-200">
        <nav className="mx-auto max-w-7xl flex items-center justify-between gap-6 px-4 md:px-6 py-3">
          <Link href="/" aria-label="Retour à l'accueil Hadar.ma" className="shrink-0">
            <Logo size="md" />
          </Link>

          <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-navy">
            <li>
              <Link href="/" className="hover:text-brand-blue transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/comment-ca-marche" className="hover:text-brand-blue transition-colors">
                Comment ça marche
              </Link>
            </li>
            <li>
              <Link href="/statistiques" className="hover:text-brand-blue transition-colors">
                Statistiques
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageCurrencySwitcher />
            </div>

            <LoginButton />

            <Link
              href="/signaler"
              className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
            >
              <Siren className="h-4 w-4" aria-hidden />
              Signaler
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
