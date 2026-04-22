'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Language = 'fr' | 'ar' | 'en';

const LANGUAGES: { id: Language; label: string; native: string; flag: string }[] = [
  { id: 'fr', label: 'Français', native: 'Français', flag: '🇫🇷' },
  { id: 'ar', label: 'Arabe', native: 'العربية', flag: '🇲🇦' },
  { id: 'en', label: 'Anglais', native: 'English', flag: '🇬🇧' },
];

const KEY = 'hadar:lang';

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Language>('fr');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(KEY)) as
      | Language
      | null;
    if (stored && LANGUAGES.some((l) => l.id === stored)) setLang(stored);
  }, []);

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

  const select = (id: Language) => {
    setLang(id);
    localStorage.setItem(KEY, id);
    setOpen(false);
  };

  const current = LANGUAGES.find((l) => l.id === lang)!;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Changer la langue"
        className="inline-flex items-center gap-1.5 rounded-pill hover:bg-gray-50 px-2 py-1.5 text-xs font-semibold text-brand-navy transition-colors"
      >
        <span aria-hidden className="text-base leading-none">
          {current.flag}
        </span>
        <span className="uppercase">{current.id}</span>
        <ChevronDown className="h-3 w-3 text-gray-400" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50 py-1"
        >
          {LANGUAGES.map((l) => {
            const active = l.id === lang;
            return (
              <button
                key={l.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => select(l.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                  active ? 'text-brand-navy font-semibold' : 'text-gray-600'
                }`}
              >
                <span className="inline-flex items-center gap-2">
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
