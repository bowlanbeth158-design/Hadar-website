'use client';

import { useEffect, useRef, useState } from 'react';
import { UserRound, Clock, ChevronsLeft, ChevronsRight, Sparkles } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

type RiskLevel = 'vigilance' | 'modere' | 'eleve';

type DemoReport = {
  id: string;
  title: string;
  description: string;
  similar: number;
  date: string;
  risk: RiskLevel;
};

const DEMO_REPORTS: DemoReport[] = [
  {
    id: 'd1',
    title: 'Signalement avec éléments fournis',
    description:
      'Ce contact demande un paiement via PayPal puis cesse de répondre après réception.',
    similar: 5,
    date: 'il y a 1 jour',
    risk: 'eleve',
  },
  {
    id: 'd2',
    title: 'Signalement avec éléments fournis',
    description:
      'Site de vente qui encaisse le paiement sans jamais livrer la commande ni répondre au support.',
    similar: 8,
    date: 'il y a 2 jours',
    risk: 'eleve',
  },
  {
    id: 'd3',
    title: 'Signalement avec éléments fournis',
    description:
      'Faux compte se faisant passer pour un marchand officiel pour vendre des produits contrefaits.',
    similar: 3,
    date: 'il y a 3 jours',
    risk: 'modere',
  },
  {
    id: 'd4',
    title: 'Signalement avec éléments fournis',
    description:
      'Produit reçu totalement différent de la description initiale, et vendeur refusant le remboursement.',
    similar: 2,
    date: 'il y a 4 jours',
    risk: 'vigilance',
  },
  {
    id: 'd5',
    title: 'Signalement avec éléments fournis',
    description:
      'Numéro WhatsApp utilisé pour fausses promotions, redirige vers un site de phishing.',
    similar: 12,
    date: 'il y a 5 jours',
    risk: 'eleve',
  },
  {
    id: 'd6',
    title: 'Signalement avec éléments fournis',
    description:
      'RIB partagé dans un groupe Telegram pour recevoir des paiements puis disparition du contact.',
    similar: 4,
    date: 'il y a 6 jours',
    risk: 'modere',
  },
];

type RiskStyle = {
  dot: string;
  bg: string;
  text: string;
  border: string;
  // Tailwind classes for the static base layer of the top stripe.
  stripeBase: string;
  // Tailwind classes for the moving comet layer (300% wide
  // symmetric gradient with brighter highlight in the centre).
  // The animate-stripe-travel keyframe slides its background-position
  // from right to left so the bright spot looks like a scanning beam.
  stripeComet: string;
  // Soft outer halo dropped just below the stripe for depth.
  haloFrom: string;
  label: string;
};

const RISK_STYLE: Record<RiskLevel, RiskStyle> = {
  vigilance: {
    dot: 'bg-yellow-300',
    bg: 'bg-yellow-100/90',
    text: 'text-yellow-500',
    border: 'border-yellow-500/40',
    stripeBase: 'bg-gradient-to-r from-yellow-300/12 via-yellow-300/22 to-yellow-300/12',
    stripeComet:
      'bg-[linear-gradient(90deg,transparent_0%,rgba(251,237,33,0)_35%,rgba(251,237,33,0.55)_50%,rgba(251,237,33,0)_65%,transparent_100%)]',
    haloFrom: 'from-yellow-300/15',
    label: 'Vigilance',
  },
  modere: {
    dot: 'bg-orange-500',
    bg: 'bg-orange-100/90',
    text: 'text-orange-500',
    border: 'border-orange-500/40',
    stripeBase: 'bg-gradient-to-r from-orange-500/12 via-orange-500/22 to-orange-500/12',
    stripeComet:
      'bg-[linear-gradient(90deg,transparent_0%,rgba(242,155,17,0)_35%,rgba(242,155,17,0.55)_50%,rgba(242,155,17,0)_65%,transparent_100%)]',
    haloFrom: 'from-orange-500/15',
    label: 'Modéré',
  },
  eleve: {
    dot: 'bg-red-500',
    bg: 'bg-red-100/90',
    text: 'text-red-700',
    border: 'border-red-500/40',
    stripeBase: 'bg-gradient-to-r from-red-500/14 via-red-500/24 to-red-500/14',
    stripeComet:
      'bg-[linear-gradient(90deg,transparent_0%,rgba(238,68,68,0)_35%,rgba(238,68,68,0.6)_50%,rgba(238,68,68,0)_65%,transparent_100%)]',
    haloFrom: 'from-red-500/18',
    label: 'Élevé',
  },
};

export function RecentReports() {
  // Ref to the horizontally-scrollable cards container so the swipe-hint
  // chevrons can scroll the next/previous batch of cards into view on click.
  const scrollerRef = useRef<HTMLDivElement>(null);
  // canScrollLeft toggles the visibility of the LEFT chevron — it stays
  // hidden at the very start of the carousel and appears as soon as the
  // user has scrolled even one pixel to the right, so the cue only shows
  // up when going back is actually meaningful.
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  // One ref per card article — a setInterval below picks a random card
  // every 2 s and runs a one-shot zoom-and-bounce animation on it via
  // the Web Animations API. WAAPI lets us re-fire the animation on the
  // same element without remounting it, so React state, hover styles
  // and the rest of the card stay untouched.
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Honour the user's OS preference — no surprise motion if reduced.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const tick = () => {
      const idx = Math.floor(Math.random() * DEMO_REPORTS.length);
      const el = cardRefs.current[idx];
      if (!el) return;
      // Pause if the user already has the card hovered — the lift +
      // shadow upgrade are already in play, no need to fight them.
      if (el.matches(':hover')) return;
      el.animate(
        [
          {
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 6px 24px -6px rgba(0, 50, 125, 0.18)',
          },
          {
            transform: 'translateY(-8px) scale(1.05)',
            // Two-layer glow at the peak: a directional drop shadow
            // (depth) plus a non-offset diffuse halo so the card
            // visibly "lights up" against the page surface.
            boxShadow:
              '0 22px 50px -8px rgba(0, 120, 186, 0.65), 0 0 40px 4px rgba(0, 191, 238, 0.55)',
            offset: 0.5,
          },
          {
            transform: 'translateY(0) scale(1)',
            boxShadow: '0 6px 24px -6px rgba(0, 50, 125, 0.18)',
          },
        ],
        {
          // Slow, deliberate breath — 1.6 s total with a smooth
          // ease-in-out so the lift reads as a confident "pulse"
          // rather than a quick jitter. No elastic overshoot —
          // straight scale up to 1.05 and back down for a polished
          // feel that matches the rest of the brand surface.
          duration: 1600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'none',
        },
      );
    };

    const id = window.setInterval(tick, 2000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setCanScrollLeft(el.scrollLeft > 4);
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollByStep = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Scroll by ~75% of the visible width so two cards roughly slide in.
    const step = Math.round(el.clientWidth * 0.75) * direction;
    if (direction > 0) {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        // Wrap back to the start when we've reached the end.
        el.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
    }
    el.scrollBy({ left: step, behavior: 'smooth' });
  };

  const scrollNext = () => scrollByStep(1);
  const scrollPrev = () => scrollByStep(-1);

  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-10 md:py-14">
      {/* "Live update" pill — upgraded with a soft brand-blue halo, a
          tiny Sparkles icon, the pulsing green dot, the count, and the
          shimmer light. Floats gently up-down (animate-float-soft). */}
      <div className="flex justify-center">
        <span className="relative inline-flex items-center gap-2 rounded-pill border border-white/80 bg-gradient-to-r from-brand-sky via-blue-100 to-brand-sky text-brand-navy px-4 py-1.5 text-xs md:text-sm font-semibold shadow-glow-blue overflow-hidden animate-float-soft">
          <Sparkles className="h-3.5 w-3.5 text-brand-blue animate-sparkle-pop" aria-hidden />
          <span className="relative flex h-2 w-2">
            <span
              aria-hidden
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"
            />
            <span
              aria-hidden
              className="relative inline-flex h-2 w-2 rounded-full bg-green-500"
            />
          </span>
          <span className="relative z-10">Mis à jour en direct</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
          />
        </span>
      </div>

      <h2 className="mt-3 text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Signalements récents de la communauté
      </h2>

      <p className="mt-2 text-sm text-gray-500 text-center">
        Les 6 derniers signalements publiés par la communauté
      </p>

      {/* Wrapper sits relative so the swipe-hint chevron can dock on the
          right edge regardless of how far the carousel has been scrolled. */}
      <div className="relative mt-6">
        <div
          ref={scrollerRef}
          className="overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
        >
          <ul className="flex gap-4">
            {DEMO_REPORTS.map((r, i) => {
              const style = RISK_STYLE[r.risk];
              return (
                <li
                  key={r.id}
                  className="snap-start shrink-0 w-[82%] sm:w-[48%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] animate-fade-in-down"
                  style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
                >
                  {/* Translucent gradient card — same recipe as the banner's
                      "Recherche instantanée" panel: brand-sky tint top-left,
                      fades to white in the middle, picks up brand-sky again
                      bottom-right. Keeps the page palette homogeneous instead
                      of stamping a hard white box on the sky-tinted backdrop. */}
                  <article
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="group relative h-full rounded-2xl bg-gradient-to-br from-brand-sky/35 via-white to-brand-sky/45 backdrop-blur-sm border border-white/70 p-5 pt-6 flex flex-col shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
                  >
                    {/* Risk-coloured top stripe — three layers stacked at
                        the top edge of the card to give it a "live data"
                        feel without resorting to garish flat colour:
                          1. base — soft symmetric gradient in the risk
                             colour, always present so the card is still
                             recognisable on prefers-reduced-motion.
                          2. comet — a 300%-wide gradient with a bright
                             highlight in the centre, animated via
                             stripe-travel so the highlight scans
                             continuously across the rail (3.5 s loop).
                          3. halo — a short coloured glow that bleeds
                             below the stripe into the card body for
                             extra depth.
                        Each card gets a tiny animation-delay derived
                        from its index so the comets across the row
                        don't fire in lockstep. */}
                    <div
                      aria-hidden
                      className={`absolute top-0 inset-x-0 h-[2px] ${style.stripeBase}`}
                    />
                    <div
                      aria-hidden
                      className={`absolute top-0 inset-x-0 h-[2px] bg-[length:300%_100%] ${style.stripeComet} animate-stripe-travel mix-blend-screen`}
                      style={{ animationDelay: `${(i % 3) * 350}ms` }}
                    />
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute top-[2px] inset-x-0 h-4 bg-gradient-to-b ${style.haloFrom} to-transparent opacity-40`}
                    />

                    {/* Shimmer light passes diagonally across on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"
                    />

                    <div className="flex items-start justify-between mb-3 relative">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-8 w-8 rounded-full bg-gradient-to-br from-white via-brand-sky to-white flex items-center justify-center border border-brand-blue/30 shadow-sm group-hover:scale-110 transition-transform"
                        >
                          <UserRound className="h-4 w-4 text-brand-navy" aria-hidden />
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          Utilisateur anonyme
                        </span>
                      </div>

                      {/* Risk badge — pill with pulsing dot in the matching colour */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-pill ${style.bg} ${style.text} border ${style.border} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm`}
                        aria-label={`Niveau de risque : ${style.label}`}
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          <span
                            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-60`}
                          />
                          <span
                            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`}
                          />
                        </span>
                        {style.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-brand-navy flex items-start gap-1.5 relative">
                      {/* Animated VerifiedBadge — soft brand-blue pulsing
                          halo behind the badge + sparkle-pop on the SVG
                          itself so the "vérifié" cue reads as live. */}
                      <span className="relative inline-flex h-4 w-4 shrink-0 mt-0.5">
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-brand-blue/30 blur-md animate-pulse"
                        />
                        <VerifiedBadge className="relative h-4 w-4 animate-sparkle-pop drop-shadow-sm" />
                      </span>
                      <span>{r.title}</span>
                    </h3>

                    <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1 relative">
                      {r.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs border-t border-white/60 pt-3 relative">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <span className="font-bold text-base bg-gradient-to-r from-brand-navy to-brand-blue bg-clip-text text-transparent tabular-nums">
                          {r.similar}
                        </span>
                        <span className="text-gray-500">similaires</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" aria-hidden />
                        {r.date}
                      </span>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Swipe-hint chevron LEFT — only rendered once the carousel has
            actually been scrolled away from the start, so the back arrow
            doesn't appear redundant on first load. Same visual recipe as
            the right chevron but mirrored, with an opacity transition so
            its appearance feels smooth instead of popping in. */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Voir les signalements précédents"
          aria-hidden={!canScrollLeft}
          tabIndex={canScrollLeft ? 0 : -1}
          className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1 group cursor-pointer transition-all duration-300 ${
            canScrollLeft
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 -translate-x-2 pointer-events-none'
          }`}
        >
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-brand-sky via-blue-100 to-brand-sky text-brand-navy border border-brand-blue/30 shadow-glow-blue animate-float-soft group-hover:scale-110 group-hover:shadow-glow-navy transition-all duration-300">
            <ChevronsLeft className="h-6 w-6 animate-trend-up" aria-hidden />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-navy/70 group-hover:text-brand-navy transition-colors">
            Retour
          </span>
        </button>

        {/* Swipe-hint chevron RIGHT — clickable button on lg+ that scrolls
            the cards container by ~75% of its width on each press. Wraps
            to the start when reaching the end so the user can keep
            cycling through the feed. Always visible. */}
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Voir les signalements suivants"
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1 group cursor-pointer"
        >
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-brand-sky via-blue-100 to-brand-sky text-brand-navy border border-brand-blue/30 shadow-glow-blue animate-float-soft group-hover:scale-110 group-hover:shadow-glow-navy transition-all duration-300">
            <ChevronsRight className="h-6 w-6 animate-trend-up" aria-hidden />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-navy/70 group-hover:text-brand-navy transition-colors">
            Glisser
          </span>
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center max-w-3xl mx-auto">
        Les contenus sont examinés avant publication et peuvent être modifiés ou supprimés
        s&apos;ils ne respectent pas nos règles.
      </p>
    </section>
  );
}
