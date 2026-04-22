'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, Siren, UserCircle2, UserRound } from 'lucide-react';

const ITEMS = [
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
        className="inline-flex items-center gap-2 rounded-pill border border-gray-200 bg-white text-brand-navy px-3 py-1.5 text-sm font-semibold hover:border-brand-blue transition-colors"
      >
        <UserCircle2 className="h-5 w-5 text-gray-400" aria-hidden />
        <span className="hidden md:inline">Mon compte</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50 py-1"
        >
          {ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-navy hover:bg-gray-50"
            >
              <Icon className="h-4 w-4 text-gray-400" aria-hidden />
              {label}
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
