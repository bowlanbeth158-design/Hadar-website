'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, HelpCircle, Bell, Siren } from 'lucide-react';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { CurrencySwitcher } from './CurrencySwitcher';
import { UserMenu } from './UserMenu';
import { AlertsPopover } from './AlertsPopover';
import { useI18n } from '@/lib/i18n/provider';

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

// Mobile-only hamburger drawer. Opens a small dropdown anchored to
// the start of the header with the 4 main pages so phone users still
// reach Accueil / Comment ça marche / Mes alertes / Mes signalements
// without scrolling through the desktop centre nav (which is hidden).
function MobileNavMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const items: { href: string; labelKey: string; Icon: typeof Home }[] = [
    { href: '/',                  labelKey: 'nav.home',           Icon: Home },
    { href: '/comment-ca-marche', labelKey: 'nav.howItWorks',     Icon: HelpCircle },
    { href: '/mes-alertes',       labelKey: 'nav.myAlerts',       Icon: Bell },
    { href: '/mes-signalements',  labelKey: 'userMenu.myReports', Icon: Siren },
  ];

  const hasAlerts = ALERT_COUNT > 0;

  return (
    <div ref={rootRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={open ? t('header.menuClose') : t('header.menuOpen')}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-brand-navy hover:border-brand-blue hover:text-brand-blue hover:shadow-glow-soft transition-all duration-200 ${
          // Constant brand-blue pulse halo when there are unread
          // alerts so the hamburger draws the eye on phone, idle
          // soft hover otherwise. animate-sparkle-pop on the icon
          // adds a subtle continuous breath in both states.
          hasAlerts
            ? 'border-brand-blue/40 shadow-glow-soft animate-pulse-blue'
            : 'border-gray-200'
        }`}
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden />
        ) : (
          <Menu className="h-4 w-4 animate-sparkle-pop" aria-hidden />
        )}
        {/* Unread-alerts COUNT badge — replaces the previous red dot
            so the user reads the actual number directly from the
            hamburger. Red pill with the number (clamped to 99+ so
            it stays compact) + animated ping halo behind it. Hidden
            when the drawer is open (would overlap the X). */}
        {hasAlerts && !open && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 flex"
          >
            <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-red-500 opacity-60 animate-ping" />
            <span className="relative inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-white text-[9px] font-bold tabular-nums px-1 leading-none">
              {ALERT_COUNT > 99 ? '99+' : ALERT_COUNT}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute start-0 top-full mt-2 w-60 rounded-2xl border border-gray-200 bg-white shadow-glow-soft p-2 animate-fade-in-down z-50"
        >
          <ul className="flex flex-col">
            {items.map(({ href, labelKey, Icon }) => {
              const isAlerts = href === '/mes-alertes';
              return (
                <li key={href}>
                  <Link
                    href={href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-navy hover:bg-brand-sky/40 hover:text-brand-blue transition-colors"
                  >
                    <Icon className="h-4 w-4 text-brand-blue" aria-hidden />
                    <span className="flex-1">{t(labelKey)}</span>
                    {/* Show a numeric red badge next to "Mes alertes" if
                        the user has unread alerts. The hamburger button
                        already pulses blue + has a red dot, this badge
                        tells the user where the alerts live once the
                        drawer is open. */}
                    {isAlerts && hasAlerts && (
                      <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold tabular-nums px-1.5 shadow-sm animate-pulse">
                        {ALERT_COUNT}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { t } = useI18n();

  return (
    <>
      {/* Top WhatsApp strip — full-width centered on the page,
          same brand-navy → blue gradient + soft radial glow as the
          support widget header. */}
      <div className="relative w-full bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy text-white text-xs md:text-sm py-2 px-4 text-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]"
        />
        <span className="relative">{t('header.whatsappStrip')}</span>
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-200">
        <nav className="mx-auto max-w-[1440px] grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-4 md:px-10 py-3">
          {/* LEFT cell — desktop: Logo. Mobile: hamburger drawer. */}
          <div className="flex items-center md:justify-start">
            <MobileNavMenu />
            <Link
              href="/"
              aria-label={t('header.homeAria')}
              className="hidden md:inline-flex shrink-0"
            >
              <Logo size="lg" />
            </Link>
          </div>

          {/* CENTER cell — desktop: page nav. Mobile: Logo
              centred on the same axis as the WhatsApp strip above. */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              aria-label={t('header.homeAria')}
              className="md:hidden shrink-0"
            >
              <Logo size="lg" />
            </Link>
            <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-navy">
              <li>
                <Link href="/" className={`inline-block ${NAV_LINK_HOVER}`}>
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className={`inline-block ${NAV_LINK_HOVER}`}>
                  {t('nav.howItWorks')}
                </Link>
              </li>
              <li>
                <AlertsPopover count={ALERT_COUNT} />
              </li>
            </ul>
          </div>

          {/* RIGHT — langue + devise (desktop) + profil (always) */}
          <div className="flex items-center justify-end gap-3">
            <div className="hidden sm:flex items-center gap-1 pr-3 border-r border-gray-200">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
            <UserMenu />
          </div>
        </nav>
      </header>
    </>
  );
}
