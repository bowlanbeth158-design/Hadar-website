'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  /** Animation duration in ms. Default 1200. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** Number of decimals to keep. Default 0. */
  decimals?: number;
};

/**
 * Animated counter that eases from 0 → `to` once on mount, using
 * requestAnimationFrame and an ease-out cubic curve. Re-runs only when
 * `to` actually changes.
 */
export function CountUp({ to, duration = 1200, prefix = '', suffix = '', decimals = 0 }: Props) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    let frame = 0;
    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(eased * to);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to, duration]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('fr-FR');

  // Force LTR direction on the number so RTL contexts (Arabic) don't
  // reorder the prefix / suffix or the digit-spacing — "+10 000"
  // must read "+10 000", not "000 10+".
  return (
    <span dir="ltr" className="inline-block">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
