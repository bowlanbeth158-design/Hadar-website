'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import type { Locale } from '@/lib/i18n/messages';

const LANGUAGES: { id: Locale; native: string; flag: string }[] = [
  { id: 'fr', native: 'Français', flag: '🇫🇷' },
  { id: 'ar', native: 'العربية', flag: '🇲🇦' },
  { id: 'en', native: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher() {
  // Single source of truth for the active locale: the i18n provider
  // (mounted in app/layout.tsx). Removes the previous local-only
  // `hadar:lang` localStorage flag that was orphaned from the
  // provider's `hadar:settings:lang`, so changing the language now
  // ACTUALLY swaps every translated surface across the site.
  const { locale, setLocale, t } = useI18n();
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

  const select = (id: Locale) => {
    setLocale(id);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.id === locale)!;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('langSwitcher.label')}
        className="inline-flex items-center gap-1.5 rounded-pill hover:bg-gray-50 hover:shadow-glow-soft hover:scale-[1.03] px-2 py-1.5 text-xs font-semibold text-brand-navy transition-all duration-200 ease-out"
      >
        <span aria-hidden className="text-base leading-none">
          {current.flag}
        </span>
        <span className="uppercase">{current.id}</span>
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50 py-1 animate-fade-in-down"
        >
          {LANGUAGES.map((l) => {
            const active = l.id === locale;
            return (
              <button
                key={l.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => select(l.id)}
                className={`group relative w-full flex items-center justify-between gap-2 px-3 py-2 text-sm
                            hover:bg-gray-50 transition-colors duration-200
                            before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                            before:h-0 before:w-[3px] before:rounded-r-full
                            before:bg-gradient-to-b before:from-brand-navy before:via-brand-blue before:to-brand-sky
                            before:transition-all before:duration-300 hover:before:h-2/3 ${
                              active ? 'text-brand-navy font-semibold' : 'text-gray-600'
                            }`}
              >
                <span className="inline-flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-0.5">
                  <span aria-hidden className="text-base leading-none">
                    {l.flag}
                  </span>
                  {l.native}
                </span>
                {active && <Check className="h-4 w-4 text-brand-blue" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
