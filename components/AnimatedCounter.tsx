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
  const [current, setCurrent] = useState<number>(target !== null ? 0 : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played.current) {
            played.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - p, 3);
              setCurrent(Math.round(eased * target));
              if (p < 1) requestAnimationFrame(tick);
              else setCurrent(target);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
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
