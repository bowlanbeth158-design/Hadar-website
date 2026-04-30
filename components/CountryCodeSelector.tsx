'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export type Country = {
  iso: string;
  name: string;
  dial: string; // including the leading "+"
  flag: string;
};

// Curated list — Morocco first, then countries with the largest
// Moroccan diaspora (FR, ES, BE, NL, IT, DE, CA, US, UK, others
// commonly involved in cross-border scams). Sorted manually so the
// most likely picks float to the top of the list.
const COUNTRIES: Country[] = [
  { iso: 'MA', name: 'Maroc',           dial: '+212', flag: '🇲🇦' },
  { iso: 'FR', name: 'France',          dial: '+33',  flag: '🇫🇷' },
  { iso: 'ES', name: 'Espagne',         dial: '+34',  flag: '🇪🇸' },
  { iso: 'BE', name: 'Belgique',        dial: '+32',  flag: '🇧🇪' },
  { iso: 'NL', name: 'Pays-Bas',        dial: '+31',  flag: '🇳🇱' },
  { iso: 'IT', name: 'Italie',          dial: '+39',  flag: '🇮🇹' },
  { iso: 'DE', name: 'Allemagne',       dial: '+49',  flag: '🇩🇪' },
  { iso: 'GB', name: 'Royaume-Uni',     dial: '+44',  flag: '🇬🇧' },
  { iso: 'US', name: 'États-Unis',      dial: '+1',   flag: '🇺🇸' },
  { iso: 'CA', name: 'Canada',          dial: '+1',   flag: '🇨🇦' },
  { iso: 'CH', name: 'Suisse',          dial: '+41',  flag: '🇨🇭' },
  { iso: 'PT', name: 'Portugal',        dial: '+351', flag: '🇵🇹' },
  { iso: 'DZ', name: 'Algérie',         dial: '+213', flag: '🇩🇿' },
  { iso: 'TN', name: 'Tunisie',         dial: '+216', flag: '🇹🇳' },
  { iso: 'EG', name: 'Égypte',          dial: '+20',  flag: '🇪🇬' },
  { iso: 'SN', name: 'Sénégal',         dial: '+221', flag: '🇸🇳' },
  { iso: 'CI', name: "Côte d'Ivoire",   dial: '+225', flag: '🇨🇮' },
  { iso: 'AE', name: 'Émirats arabes unis', dial: '+971', flag: '🇦🇪' },
  { iso: 'SA', name: 'Arabie saoudite', dial: '+966', flag: '🇸🇦' },
  { iso: 'QA', name: 'Qatar',           dial: '+974', flag: '🇶🇦' },
  { iso: 'KW', name: 'Koweït',          dial: '+965', flag: '🇰🇼' },
  { iso: 'TR', name: 'Turquie',         dial: '+90',  flag: '🇹🇷' },
  { iso: 'CN', name: 'Chine',           dial: '+86',  flag: '🇨🇳' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]!;

type Props = {
  value: Country;
  onChange: (c: Country) => void;
  // Inline-start anchor (popover opens to the right). Defaults to
  // 'start' since the selector typically sits at the leading edge of
  // a phone-input row.
  align?: 'start' | 'end';
};

export function CountryCodeSelector({ value, onChange, align = 'start' }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dial.includes(q),
    );
  }, [query]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Indicatif pays — ${value.name} ${value.dial}`}
        className="inline-flex items-center gap-1.5 h-full rounded-l-xl bg-white/85 backdrop-blur-sm border border-r-0 border-gray-200 px-3 text-sm font-semibold text-brand-navy hover:border-brand-blue hover:text-brand-blue focus:outline-none focus:border-brand-blue transition-colors"
      >
        <span aria-hidden className="text-base leading-none">
          {value.flag}
        </span>
        <span className="tabular-nums">{value.dial}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute ${align === 'start' ? 'start-0' : 'end-0'} top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl bg-[#ffffff] dark:bg-[#0b1220] border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden z-50 animate-fade-in-down`}
        >
          <div className="p-2 border-b border-gray-100 dark:border-white/10">
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                aria-hidden
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un pays…"
                className="w-full rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 pl-8 pr-2.5 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
                autoFocus
              />
            </div>
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.map((c) => {
              const active = c.iso === value.iso;
              return (
                <li key={c.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span aria-hidden className="text-base leading-none shrink-0">
                      {c.flag}
                    </span>
                    <span className="flex-1 text-start text-brand-navy truncate">
                      {c.name}
                    </span>
                    <span className="text-gray-500 tabular-nums text-xs">
                      {c.dial}
                    </span>
                    {active && (
                      <Check className="h-4 w-4 text-brand-blue shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-gray-400">
                Aucun pays trouvé
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
