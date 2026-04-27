'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

// Client-side wrapper around the "Vérifier maintenant" CTA in the
// HomeBanner. The previous Server-rendered <Link href="#recherche">
// relied on the browser's native anchor scroll + CSS `scroll-smooth`,
// which on some browsers / setups still produced a near-instant jump.
// This component intercepts the click and runs window.scrollTo with
// `behavior: 'smooth'` ourselves, with a -88 px header offset so the
// search card lands just below the sticky topbar instead of being
// pinned behind it.
export function VerifyNowCta() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined') return;
    const target = document.getElementById('recherche');
    if (!target) return; // let the default anchor jump happen as a fallback
    e.preventDefault();
    const HEADER_OFFSET = 88;
    const y = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
    // Keep the URL in sync so back/forward navigation still works,
    // but use replaceState so the silent hash update doesn't pollute
    // the history stack.
    window.history.replaceState(null, '', '#recherche');
  };

  return (
    <Link
      href="#recherche"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-pill bg-green-500 hover:bg-green-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-green animate-verify-pulse hover:scale-[1.03] hover:[animation-play-state:paused] transition-all"
    >
      <ShieldCheck className="h-5 w-5 animate-siren-wiggle" aria-hidden />
      Vérifier maintenant
    </Link>
  );
}
