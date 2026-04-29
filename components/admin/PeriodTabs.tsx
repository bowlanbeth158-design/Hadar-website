'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

const PERIOD_KEYS = [
  'period.today',
  'period.yesterday',
  'period.7d',
  'period.30d',
  'period.365d',
  'period.custom',
] as const;

const CUSTOM_INDEX = 5;

type Props = {
  defaultActive?: number;
  onChange?: (period: string, index: number, range?: { from: string; to: string }) => void;
};

export function PeriodTabs({ defaultActive = 0, onChange }: Props) {
  const { t } = useI18n();
  const [active, setActive] = useState(defaultActive);
  const [showPicker, setShowPicker] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setShowPicker(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPicker(false);
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onEsc);
    };
  }, [showPicker]);

  const customLabel = from && to ? `${formatShort(from)} → ${formatShort(to)}` : t('period.custom');

  const select = (i: number) => {
    setActive(i);
    if (i === CUSTOM_INDEX) {
      setShowPicker(true);
      return;
    }
    setShowPicker(false);
    const key = PERIOD_KEYS[i] ?? PERIOD_KEYS[0];
    onChange?.(t(key), i);
  };

  const applyRange = () => {
    if (!from || !to) return;
    setShowPicker(false);
    onChange?.(customLabel, CUSTOM_INDEX, { from, to });
  };

  return (
    <div ref={rootRef} className="relative flex justify-center">
      <div
        role="tablist"
        aria-label={t('period.label')}
        className="inline-flex flex-wrap justify-center gap-2 p-1.5 rounded-pill bg-brand-sky/40 shadow-glow-soft"
      >
        {PERIOD_KEYS.map((key, i) => {
          const on = i === active;
          const isCustom = i === CUSTOM_INDEX;
          const label = isCustom && from && to ? customLabel : t(key);
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => select(i)}
              className={
                on
                  ? 'min-w-[118px] rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy transition-all'
                  : 'min-w-[118px] rounded-pill text-brand-navy px-5 py-2 text-sm font-medium hover:bg-white/70 transition-colors'
              }
            >
              {isCustom && <Calendar className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />}
              {label}
            </button>
          );
        })}
      </div>

      {showPicker && (
        <div className="absolute top-full mt-2 z-30 w-80 rounded-2xl bg-white border border-gray-200 shadow-glow-navy p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-brand-navy">{t('period.customTitle')}</p>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              aria-label={t('common.close')}
              className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-navy"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="grid gap-3">
            <div>
              <label htmlFor="from" className="block text-xs font-semibold text-brand-navy mb-1">
                {t('period.from')}
              </label>
              <input
                id="from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="to" className="block text-xs font-semibold text-brand-navy mb-1">
                {t('period.to')}
              </label>
              <input
                id="to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setFrom('');
                setTo('');
              }}
              className="text-xs text-gray-500 hover:text-brand-navy"
            >
              {t('period.reset')}
            </button>
            <button
              type="button"
              onClick={applyRange}
              disabled={!from || !to}
              className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold shadow-glow-navy hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {t('period.apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatShort(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y?.slice(2)}`;
}
