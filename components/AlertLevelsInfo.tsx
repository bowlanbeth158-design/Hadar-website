'use client';

import { useEffect, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

type Props = {
  // 'sm' for the compact mobile card3, 'md' for the desktop card3.
  size?: 'sm' | 'md';
};

const LEVELS = [
  {
    key: 'vigilance',
    dot: 'bg-yellow-300 ring-2 ring-yellow-100',
    range: '1–2',
  },
  {
    key: 'moderee',
    dot: 'bg-orange-500 ring-2 ring-orange-100',
    range: '3–4',
  },
  {
    key: 'elevee',
    dot: 'bg-red-500 ring-2 ring-red-100',
    range: '≥ 5',
  },
] as const;

export function AlertLevelsInfo({ size = 'md' }: Props) {
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

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const buttonSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('home.banner.card3.help.label')}
        className={`inline-flex items-center justify-center rounded-full ${buttonSize} text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors`}
      >
        <HelpCircle className={iconSize} aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('home.banner.card3.help.title')}
          className="absolute end-0 top-full mt-2 w-64 rounded-xl bg-[#ffffff] dark:bg-[#0b1220] border border-gray-200 dark:border-white/10 shadow-glow-soft p-3 z-50 animate-fade-in-down"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-xs font-bold text-brand-navy">
              {t('home.banner.card3.help.title')}
            </h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('home.banner.card3.help.close')}
              className="-mr-1 -mt-1 inline-flex items-center justify-center h-5 w-5 rounded-full text-gray-400 hover:text-brand-navy hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </div>

          <ul className="space-y-2 text-[11px] leading-snug">
            {LEVELS.map((lvl) => (
              <li key={lvl.key} className="flex items-start gap-2">
                <span className={`mt-0.5 inline-block h-2.5 w-2.5 rounded-full ${lvl.dot} shrink-0`} />
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy">
                    {t(`home.banner.card3.help.${lvl.key}.title`)}
                    <span className="ml-1.5 text-gray-400 font-normal tabular-nums">
                      ({lvl.range})
                    </span>
                  </p>
                  <p className="text-gray-500">
                    {t(`home.banner.card3.help.${lvl.key}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
