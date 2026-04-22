import Link from 'next/link';
import { Bell, Siren } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySwitcher } from './CurrencySwitcher';
import { UserMenu } from './UserMenu';

const ALERT_COUNT = 8;

export function Header() {
  return (
    <>
      <div className="w-full bg-brand-navy text-white text-xs md:text-sm py-2 px-4 text-center">
        Rejoignez notre chaîne WhatsApp pour rester informé des alertes en temps réel.
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-200">
        <nav className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 md:px-6 py-3">
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
              <Link
                href="/mes-alertes"
                className="relative inline-flex items-center gap-1.5 hover:text-brand-blue transition-colors"
              >
                Mes alertes
                <span className="relative inline-flex">
                  <Bell className="h-4 w-4" aria-hidden />
                  {ALERT_COUNT > 0 && (
                    <span
                      aria-label={`${ALERT_COUNT} nouvelles alertes`}
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                    >
                      {ALERT_COUNT > 9 ? '9+' : ALERT_COUNT}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/signaler"
              className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold shadow-glow-red transition-all"
            >
              <Siren className="h-4 w-4" aria-hidden />
              Signaler
            </Link>

            <div className="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-2">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>

            <div className="hidden sm:block border-l border-gray-200 pl-2">
              <UserMenu />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
