'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  },
  {
    key: 'moderee',
    dot: 'bg-orange-500 ring-2 ring-orange-100',
  },
  {
    key: 'elevee',
    dot: 'bg-red-500 ring-2 ring-red-100',
  },
] as const;

const POPOVER_WIDTH = 256; // matches w-64
const POPOVER_GAP = 8;

export function AlertLevelsInfo({ size = 'md' }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Recompute popover position from the button rect — used both on
  // open and when the viewport scrolls/resizes so it stays anchored.
  const updatePos = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    // Anchor right edge of popover to right edge of button (end-0
    // semantics) but keep it inside the viewport with an 8 px margin.
    const left = Math.max(
      8,
      Math.min(window.innerWidth - POPOVER_WIDTH - 8, r.right - POPOVER_WIDTH),
    );
    const top = r.bottom + POPOVER_GAP;
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    const onResize = () => updatePos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
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

  const popover = open && pos && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={t('home.banner.card3.help.title')}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
          className="rounded-xl bg-[#ffffff] dark:bg-[#0b1220] border border-gray-200 dark:border-white/10 shadow-glow-soft p-3 z-[200] animate-fade-in-down"
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
                <span
                  className={`mt-0.5 inline-block h-2.5 w-2.5 rounded-full ${lvl.dot} shrink-0`}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-brand-navy">
                    {t(`home.banner.card3.help.${lvl.key}.title`)}
                  </p>
                  <p className="text-gray-500">
                    {t(`home.banner.card3.help.${lvl.key}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('home.banner.card3.help.label')}
        className={`inline-flex items-center justify-center rounded-full ${buttonSize} text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors shrink-0`}
      >
        <HelpCircle className={iconSize} aria-hidden />
      </button>
      {popover}
    </>
  );
}
