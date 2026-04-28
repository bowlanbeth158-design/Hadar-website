'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PartyPopper, Sparkles, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

const CONFETTI_COLORS = [
  '#22C45E', // green-500 (brand alert green)
  '#0078BA', // brand blue
  '#FBED21', // yellow-300
  '#F29B11', // orange-500
  '#EE4444', // red-500
  '#8652FB', // violet
  '#00BFEE', // sky
];

// CSS-only confetti rain — generates `count` falling pieces with random
// x positions, colors, sizes, delays and durations. No JS animation loop,
// the browser handles it. Disappears after `lifetimeMs`.
function ConfettiRain({ count = 80, lifetimeMs = 5000 }: { count?: number; lifetimeMs?: number }) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setActive(false), lifetimeMs);
    return () => clearTimeout(t);
  }, [lifetimeMs]);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const duration = 2.6 + Math.random() * 2.6;
        const size = 6 + Math.random() * 6;
        const ratio = 0.5 + Math.random() * 0.5;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const drift = (Math.random() - 0.5) * 80;
        return { left, delay, duration, size, ratio, color, drift };
      }),
    [count]
  );

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block animate-confetti-fall rounded-sm"
          style={{
            left: `calc(${p.left}% + ${p.drift}px)`,
            width: `${p.size}px`,
            height: `${p.size * p.ratio}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function PublishedCelebration() {
  const { t, dir } = useI18n();
  return (
    <>
      <ConfettiRain />

      <div
        dir={dir}
        className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-glow-green animate-fade-in-down"
      >
        {/* Decorative sparkles */}
        <Sparkles
          className="pointer-events-none absolute top-3 right-6 h-5 w-5 text-white/80 animate-sparkle-pop"
          aria-hidden
        />
        <Sparkles
          className="pointer-events-none absolute bottom-4 left-8 h-4 w-4 text-white/70 animate-sparkle-pop"
          style={{ animationDelay: '300ms' }}
          aria-hidden
        />
        <Sparkles
          className="pointer-events-none absolute top-1/2 left-1/3 h-3 w-3 text-white/60 animate-sparkle-pop"
          style={{ animationDelay: '700ms' }}
          aria-hidden
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-4 p-5 md:p-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
              <PartyPopper className="h-6 w-6 text-white animate-siren-wiggle" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-lg md:text-xl font-bold leading-tight">
                {t('publishedCelebration.title')}
              </p>
              <p className="mt-1 text-sm text-white/90">
                {t('publishedCelebration.body')}
              </p>
            </div>
          </div>

          <Link
            href="/signaler"
            className="group inline-flex items-center justify-center gap-1.5 rounded-pill bg-white text-green-700 px-5 py-2.5 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-200 ease-out shrink-0"
          >
            {t('publishedCelebration.cta')}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </>
  );
}
