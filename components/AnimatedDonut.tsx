'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  value: number;
  duration?: number;
  color?: string;
  track?: string;
};

export function AnimatedDonut({
  value,
  duration = 1400,
  color = '#EE4444',
  track = '#FCE7E7',
}: Props) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<SVGSVGElement>(null);
  const played = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setCurrent(value);
      played.current = true;
      return;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const animateFromZero = () => {
      setCurrent(0);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCurrent(Math.round(eased * value));
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setCurrent(value);
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    // After the first play, every subsequent value change re-runs
    // the 0 → value tween immediately so the donut + center digit
    // animate when the period tab changes.
    if (played.current) {
      animateFromZero();
      return;
    }

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
  }, [value, duration]);

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dash = (current / 100) * circumference;

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      className="h-40 w-40"
      role="img"
      aria-label={`${value}% d'évolution`}
    >
      <circle cx="50" cy="50" r={radius} fill="none" stroke={track} strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize="22"
        fontWeight="bold"
        fill={color}
        fontFamily="var(--font-poppins), sans-serif"
      >
        {current}%
      </text>
    </svg>
  );
}
