'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  value: string;
  duration?: number;
  className?: string;
};

type Parsed = {
  prefix: string;
  number: number | null;
  suffix: string;
  sep: string;
};

function parseValue(raw: string): Parsed {
  const match = raw.match(/^(\s*[+-]?\s*)([\d][\d\s.,]*)(.*)$/);
  if (!match) return { prefix: '', number: null, suffix: raw, sep: ' ' };
  const [, prefix, numPart, rest] = match;
  const cleaned = (numPart ?? '').replace(/[\s.,]/g, '');
  const n = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(n)) return { prefix: '', number: null, suffix: raw, sep: ' ' };
  const sep = (numPart ?? '').includes(' ')
    ? ' '
    : (numPart ?? '').includes(',')
      ? ','
      : (numPart ?? '').includes('.')
        ? '.'
        : '';
  return { prefix: prefix ?? '', number: n, suffix: rest ?? '', sep };
}

function formatNumber(n: number, sep: string): string {
  const asString = Math.floor(n).toString();
  if (!sep) return asString;
  return asString.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

export function AnimatedCounter({ value, duration = 1400, className }: Props) {
  const parsed = parseValue(value);
  const target = parsed.number;
  const [current, setCurrent] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    if (!ref.current) return;
    const node = ref.current;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setCurrent(target);
      played.current = true;
      return;
    }

    // Cancel any in-flight animation so a fast burst of value changes
    // (e.g. spamming the period tabs) doesn't stack RAF callbacks.
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Helper that runs the 0 → target tween. Easing is the same
    // ease-out-cubic the previous version used.
    const animateFromZero = () => {
      setCurrent(0);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCurrent(Math.round(eased * target));
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setCurrent(target);
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    // After the first play (initial mount), every subsequent value
    // change re-animates immediately from 0 to the new target — no
    // need to wait for the IntersectionObserver again. This is what
    // makes the KPI cards / chart labels visibly count up whenever
    // the period or count↔% mode changes.
    if (played.current) {
      animateFromZero();
      return;
    }

    // First play: wait until the element scrolls into view (≥30%)
    // before kicking off the tween, so KPIs below the fold don't
    // burn their animation while still hidden.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played.current) {
            played.current = true;
            animateFromZero();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, duration]);

  if (target === null) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {formatNumber(current, parsed.sep)}
      {parsed.suffix}
    </span>
  );
}
