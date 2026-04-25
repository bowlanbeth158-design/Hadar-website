'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type Currency = 'MAD' | 'EUR' | 'USD';

const CURRENCIES: { id: Currency; label: string; symbol: string }[] = [
  { id: 'MAD', label: 'Dirham marocain', symbol: 'MAD' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
  { id: 'USD', label: 'Dollar américain', symbol: '$' },
];

const KEY = 'hadar:currency';

export function CurrencySwitcher() {
  const [currency, setCurrency] = useState<Currency>('MAD');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(KEY)) as
      | Currency
      | null;
    if (stored && CURRENCIES.some((c) => c.id === stored)) setCurrency(stored);
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

  const select = (id: Currency) => {
    setCurrency(id);
    localStorage.setItem(KEY, id);
    setOpen(false);
  };

  const current = CURRENCIES.find((c) => c.id === currency)!;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Changer la devise"
        className="inline-flex items-center gap-1.5 rounded-pill hover:bg-gray-50 hover:shadow-glow-soft hover:scale-[1.03] px-2 py-1.5 text-xs font-semibold text-brand-navy transition-all duration-200 ease-out"
      >
        <span>{current.symbol}</span>
        <ChevronDown
          className={`h-3 w-3 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white border border-gray-200 shadow-lg overflow-hidden z-50 py-1 animate-fade-in-down"
        >
          {CURRENCIES.map((c) => {
            const active = c.id === currency;
            return (
              <button
                key={c.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => select(c.id)}
                className="group relative w-full flex items-center justify-between gap-2 px-3 py-2 text-sm
                           hover:bg-gray-50 transition-colors duration-200
                           before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2
                           before:h-0 before:w-[3px] before:rounded-r-full
                           before:bg-gradient-to-b before:from-brand-navy before:via-brand-blue before:to-brand-sky
                           before:transition-all before:duration-300 hover:before:h-2/3"
              >
                <span className="whitespace-nowrap transition-transform duration-200 group-hover:translate-x-0.5">
                  <span
                    className={`font-semibold mr-2 ${active ? 'text-brand-navy' : 'text-gray-700'}`}
                  >
                    {c.symbol}
                  </span>
                  <span className="text-gray-500">{c.label}</span>
                </span>
                {active && <Check className="h-4 w-4 text-brand-blue shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
