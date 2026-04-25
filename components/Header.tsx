import Link from 'next/link';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySwitcher } from './CurrencySwitcher';
import { UserMenu } from './UserMenu';

const ALERT_COUNT = 8;

// "Pro" hover effect for the main nav links — combines:
//   1. color shift to brand-blue
//   2. subtle 1px lift (feels alive)
//   3. soft brand-themed gradient "tile" fading in BEHIND the letters
//   4. animated gradient underline (navy → blue → sky) growing from center
const NAV_LINK_HOVER =
  'isolate relative hover:text-brand-blue transition-all duration-200 ease-out hover:-translate-y-px ' +
  // brand-themed gradient tile behind the letters
  "before:content-[''] before:absolute before:-inset-x-3 before:-inset-y-1.5 " +
  'before:rounded-lg before:-z-10 ' +
  'before:bg-gradient-to-br before:from-brand-sky/40 before:via-brand-blue/8 before:to-brand-navy/0 ' +
  'before:opacity-0 before:scale-95 ' +
  'before:transition-all before:duration-300 before:ease-out ' +
  'hover:before:opacity-100 hover:before:scale-100 ' +
  // animated gradient underline
  "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-[-8px] " +
  'after:h-[2px] after:w-0 after:rounded-full ' +
  'after:bg-gradient-to-r after:from-brand-navy after:via-brand-blue after:to-brand-sky ' +
  'after:transition-all after:duration-300 after:ease-out hover:after:w-full';

export function Header() {
  return (
    <>
      {/* Top WhatsApp strip — full-width centered on the page */}
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

          {/* CENTER — nav (page-centered, sharing the same central axis as the WhatsApp banner) */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-navy">
            <li>
              <Link href="/" className={`inline-block ${NAV_LINK_HOVER}`}>
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/comment-ca-marche" className={`inline-block ${NAV_LINK_HOVER}`}>
                Comment ça marche
              </Link>
            </li>
            <li>
              <Link
                href="/mes-alertes"
                className={`inline-flex items-center gap-1.5 ${NAV_LINK_HOVER}`}
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
