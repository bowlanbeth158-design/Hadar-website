'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronDown, LogOut, Siren, UserCircle2, UserRound } from 'lucide-react';

const ALERT_COUNT = 8;

const ITEMS = [
  { href: '/mes-alertes', label: 'Mes alertes', Icon: Bell, badge: ALERT_COUNT },
  { href: '/mes-signalements', label: 'Mes signalements', Icon: Siren },
  { href: '/mon-profil', label: 'Mon profil', Icon: UserRound },
];

export function UserMenu() {
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
        className="relative inline-flex items-center gap-2 rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2 text-sm font-semibold hover:border-brand-blue hover:shadow-glow-soft transition-all"
      >
        <UserCircle2 className="h-5 w-5 text-gray-400" aria-hidden />
        <span className="hidden md:inline">Mon compte</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        {ALERT_COUNT > 0 && (
          <span
            aria-label={`${ALERT_COUNT} nouvelles alertes`}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white"
          >
            {ALERT_COUNT > 9 ? '9+' : ALERT_COUNT}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50 py-1"
        >
          {ITEMS.map(({ href, label, Icon, badge }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-brand-navy hover:bg-gray-50"
            >
              <span className="inline-flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-400" aria-hidden />
                {label}
              </span>
              {badge && badge > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          ))}
          <div className="my-1 border-t border-gray-100" />
          <Link
            href="/connexion"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Déconnexion
          </Link>
        </div>
      )}
    </div>
  );
}
