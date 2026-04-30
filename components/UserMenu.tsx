'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, Siren, UserCircle2, UserRound } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

// Profile dropdown items. "Mes signalements" is also in the mobile
// hamburger drawer, so we hide that line on phone via mobileHidden
// to avoid duplicating the same link in the same header — but keep
// it on desktop where the hamburger drawer is itself hidden.
const ITEMS: { href: string; labelKey: string; Icon: typeof UserRound; mobileHidden?: boolean }[] = [
  { href: '/mes-signalements', labelKey: 'userMenu.myReports', Icon: Siren, mobileHidden: true },
  { href: '/mon-profil',       labelKey: 'userMenu.myProfile', Icon: UserRound },
];

export function UserMenu() {
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-pill border border-gray-200 dark:border-white/10 bg-[#ffffff] dark:bg-[#0b1220] text-brand-navy px-5 py-2 text-sm font-semibold hover:border-brand-blue hover:shadow-glow-soft hover:-translate-y-px transition-all duration-200 ease-out"
      >
        <UserCircle2 className="h-5 w-5 text-gray-400" aria-hidden />
        <span className="hidden md:inline">{t('userMenu.account')}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-2 w-60 rounded-xl bg-[#ffffff] dark:bg-[#0b1220] border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden z-50 py-1 animate-fade-in-down"
        >
          {ITEMS.map(({ href, labelKey, Icon, mobileHidden }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 px-4 py-2.5 text-sm text-brand-navy
                         hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200
                         before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                         before:h-0 before:w-[3px] before:rounded-r-full
                         before:bg-gradient-to-b before:from-brand-navy before:via-brand-blue before:to-brand-sky
                         before:transition-all before:duration-300 hover:before:h-2/3 ${
                           // Phone: this link already lives in the
                           // hamburger drawer (top-left), so we hide
                           // the duplicate here. Desktop has no
                           // hamburger so the line stays visible.
                           mobileHidden ? 'hidden md:flex' : 'flex'
                         }`}
            >
              <Icon
                className="h-4 w-4 text-gray-400 transition-all duration-200
                           group-hover:text-brand-blue group-hover:translate-x-0.5"
                aria-hidden
              />
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                {t(labelKey)}
              </span>
            </Link>
          ))}
          <div className="my-1 border-t border-gray-100 dark:border-white/10" />
          <Link
            href="/connexion"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="group relative flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                       hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200
                       before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                       before:h-0 before:w-[3px] before:rounded-r-full before:bg-red-500
                       before:transition-all before:duration-300 hover:before:h-2/3"
          >
            <LogOut
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              {t('userMenu.logout')}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
