import Link from 'next/link';
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
        <nav className="mx-auto max-w-7xl grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 md:px-10 py-3">
          {/* LEFT — logo */}
          <div className="flex items-center">
            <Link href="/" aria-label="Retour à l'accueil Hadar" className="shrink-0">
              <Logo size="lg" />
            </Link>
          </div>

          {/* CENTER — nav (centered on the page, aligned with the centered top banner text) */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-navy">
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
                className="inline-flex items-center gap-1.5 hover:text-brand-blue transition-colors"
              >
                Mes alertes
                {ALERT_COUNT > 0 && (
                  <span
                    aria-label={`${ALERT_COUNT} nouvelles alertes`}
                    className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center"
                  >
                    {ALERT_COUNT > 99 ? '99+' : ALERT_COUNT}
                  </span>
                )}
              </Link>
            </li>
          </ul>

          {/* RIGHT — langue + devise + profil */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden sm:flex items-center gap-1 pr-3 border-r border-gray-200">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
            <div className="hidden sm:block">
              <UserMenu />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
