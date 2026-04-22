'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';

type Language = 'fr' | 'ar' | 'en';
type Currency = 'MAD' | 'EUR' | 'USD';

const LANGUAGES: { id: Language; label: string; native: string }[] = [
  { id: 'fr', label: 'Français', native: 'Français' },
  { id: 'ar', label: 'Arabe', native: 'العربية' },
  { id: 'en', label: 'Anglais', native: 'English' },
];

const CURRENCIES: { id: Currency; label: string; symbol: string }[] = [
  { id: 'MAD', label: 'Dirham marocain', symbol: 'MAD' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
  { id: 'USD', label: 'Dollar américain', symbol: '$' },
];

const LANG_KEY = 'hadar:lang';
const CUR_KEY = 'hadar:currency';

export function LanguageCurrencySwitcher() {
  const [lang, setLang] = useState<Language>('fr');
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLang = (typeof window !== 'undefined' && localStorage.getItem(LANG_KEY)) as
      | Language
      | null;
    const storedCur = (typeof window !== 'undefined' && localStorage.getItem(CUR_KEY)) as
      | Currency
      | null;
    if (storedLang && LANGUAGES.some((l) => l.id === storedLang)) setLang(storedLang);
    if (storedCur && CURRENCIES.some((c) => c.id === storedCur)) setCurrency(storedCur);
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

  const selectLang = (id: Language) => {
    setLang(id);
    localStorage.setItem(LANG_KEY, id);
  };
  const selectCurrency = (id: Currency) => {
    setCurrency(id);
    localStorage.setItem(CUR_KEY, id);
  };

  const currentLang = LANGUAGES.find((l) => l.id === lang)!;
  const currentCurrency = CURRENCIES.find((c) => c.id === currency)!;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Changer la langue et la devise"
        className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-3 py-1.5 text-xs font-medium hover:border-brand-blue transition-colors"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden />
        <span className="uppercase">{currentLang.id}</span>
        <span className="text-gray-300">·</span>
        <span>{currentCurrency.symbol}</span>
        <ChevronDown className="h-3 w-3 text-gray-400" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50"
        >
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-gray-100">
            Langue
          </div>
          {LANGUAGES.map((l) => {
            const active = l.id === lang;
            return (
              <button
                key={l.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => selectLang(l.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 ${
                  active ? 'text-brand-navy font-semibold' : 'text-gray-600'
                }`}
              >
                <span>{l.native}</span>
                {active && <Check className="h-4 w-4 text-brand-blue" aria-hidden />}
              </button>
            );
          })}

          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 bg-gray-50 border-b border-t border-gray-100">
            Devise
          </div>
          {CURRENCIES.map((c) => {
            const active = c.id === currency;
            return (
              <button
                key={c.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => selectCurrency(c.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 ${
                  active ? 'text-brand-navy font-semibold' : 'text-gray-600'
                }`}
              >
                <span>
                  <span className="font-semibold mr-2">{c.symbol}</span>
                  <span className="text-gray-500">{c.label}</span>
                </span>
                {active && <Check className="h-4 w-4 text-brand-blue" aria-hidden />}
              </button>
            );
          })}

          <p className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-100">
            Les traductions complètes seront activées prochainement.
          </p>
        </div>
      )}
    </div>
  );
}
