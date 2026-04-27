import Link from 'next/link';
import {
  Users,
  Siren,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

type Stat = {
  label: string;
  value: string;
  Icon: LucideIcon;
  // Per-metric accent applied ONLY to the icon chip — not the whole
  // card — so the page palette stays calm and brand-aligned while
  // each KPI keeps an instantly recognisable colour cue.
  chip: {
    bg: string;
    text: string;
    ring: string;
    halo: string;
  };
  // Raw RGBA values for the traveling spotlight overlay, picked from
  // the brand palette so each card's halo matches its icon chip
  // (navy / red / violet / sky / green / orange). Inlined as
  // box-shadow so the colour can vary per card without exploding the
  // Tailwind class system into one variant per accent.
  spotlight: { ring: string; glow: string };
};

const KPI_STATS: Stat[] = [
  {
    label: 'Utilisateurs actifs',
    value: '12 593',
    Icon: Users,
    chip: {
      bg: 'bg-brand-navy/10',
      text: 'text-brand-navy',
      ring: 'ring-brand-navy/25',
      halo: 'bg-brand-navy/35',
    },
    // brand.navy #00327D
    spotlight: { ring: 'rgba(0, 50, 125, 0.50)', glow: 'rgba(0, 50, 125, 0.55)' },
  },
  {
    label: 'Signalements enregistrés',
    value: '19 840',
    Icon: Siren,
    chip: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      ring: 'ring-red-500/25',
      halo: 'bg-red-500/35',
    },
    // red.500 #EE4444
    spotlight: { ring: 'rgba(238, 68, 68, 0.50)', glow: 'rgba(238, 68, 68, 0.55)' },
  },
  {
    label: 'Contacts signalés',
    value: '9 594',
    Icon: Smartphone,
    chip: {
      bg: 'bg-violet-500/10',
      text: 'text-violet-500',
      ring: 'ring-violet-500/25',
      halo: 'bg-violet-500/35',
    },
    // violet.500 #8652FB
    spotlight: { ring: 'rgba(134, 82, 251, 0.50)', glow: 'rgba(134, 82, 251, 0.55)' },
  },
  {
    label: 'Vérifications réalisées',
    value: '18 978',
    Icon: ShieldCheck,
    chip: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
      ring: 'ring-sky-500/25',
      halo: 'bg-sky-500/35',
    },
    // sky.500 #00BFEE
    spotlight: { ring: 'rgba(0, 191, 238, 0.50)', glow: 'rgba(0, 191, 238, 0.60)' },
  },
  {
    label: 'Montant signalé',
    value: '504 000 MAD',
    Icon: Wallet,
    chip: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      ring: 'ring-green-500/25',
      halo: 'bg-green-500/35',
    },
    // green.500 #22C45E
    spotlight: { ring: 'rgba(34, 196, 94, 0.50)', glow: 'rgba(34, 196, 94, 0.55)' },
  },
  {
    label: 'Dernier signalement',
    value: 'il y a 2h',
    Icon: Clock,
    chip: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      ring: 'ring-orange-500/25',
      halo: 'bg-orange-500/35',
    },
    // orange.500 #F29B11
    spotlight: { ring: 'rgba(242, 155, 17, 0.50)', glow: 'rgba(242, 155, 17, 0.60)' },
  },
];

export function PlatformStats() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-12 md:py-16">
      {/* "Live update" pill — matches the same recipe used by the
          RecentReports section so the home page reads as one cohesive
          surface rather than a stack of independent components. */}
      <div className="flex justify-center">
        <span className="relative inline-flex items-center gap-2 rounded-pill border border-white/80 bg-gradient-to-r from-brand-sky via-blue-100 to-brand-sky text-brand-navy px-4 py-1.5 text-xs md:text-sm font-semibold shadow-glow-blue overflow-hidden animate-float-soft">
          <Sparkles className="h-3.5 w-3.5 text-brand-blue animate-sparkle-pop" aria-hidden />
          <span className="relative z-10">La plateforme en chiffres</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
          />
        </span>
      </div>

      <h2 className="mt-3 text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Statistiques de la plateforme
      </h2>
      <p className="mt-2 text-sm text-gray-500 text-center max-w-2xl mx-auto">
        Mises à jour en temps réel à partir des contributions de la communauté Hadar.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KPI_STATS.map((s, i) => (
          <li
            key={s.label}
            // Stagger the entrance so the row reveals card-by-card from
            // top-left to bottom-right (≈90 ms between cards). animationFillMode
            // 'both' holds the start frame until the delay fires, so cards
            // stay invisible instead of flashing in place.
            className="relative animate-fade-in-down"
            style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
          >
            {/* Spotlight overlay — sibling of the article so its outer
                box-shadow halo is NOT clipped by the article's
                overflow-hidden. Fully transparent at rest, then fades
                in / out via animate-card-spotlight on a 9 s cycle.
                Per-card animationDelay of `i * 1500ms` makes the
                highlight ripple through the grid one card at a time.
                The halo colour is taken from the card's accent
                (navy / red / violet / sky / green / orange) so each
                spotlight matches the icon chip beneath it. Both the
                inner ring and the outer glow are bundled into a
                single box-shadow so we don't need a second element. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl animate-card-spotlight"
              style={{
                animationDelay: `${i * 1500}ms`,
                boxShadow: `0 0 0 2px ${s.spotlight.ring}, 0 0 36px 8px ${s.spotlight.glow}`,
              }}
            />

            <article
              className="group relative h-full rounded-2xl bg-gradient-to-br from-white via-brand-sky/30 to-brand-sky/45 backdrop-blur-sm border border-white/70 p-5 flex items-center gap-4 shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden"
            >
              {/* Diagonal shimmer line — invisible at rest, fires on hover
                  for a subtle "wipe" of light across the card surface. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"
              />

              {/* Accent chip — small coloured square that carries the per-
                  metric identity. Pulsing halo behind, scale on hover. */}
              <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center">
                <span
                  aria-hidden
                  className={`absolute inset-0 rounded-2xl ${s.chip.halo} blur-xl opacity-40 group-hover:opacity-80 transition-opacity duration-300 animate-pulse`}
                />
                <span
                  className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl ${s.chip.bg} ${s.chip.text} ring-1 ${s.chip.ring} group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-300`}
                >
                  <s.Icon className="h-6 w-6 animate-sparkle-pop" aria-hidden />
                </span>
              </span>

              <div className="relative min-w-0">
                <p className="text-2xl md:text-3xl font-bold text-brand-navy tabular-nums leading-none">
                  <AnimatedCounter value={s.value} />
                </p>
                <p className="mt-1.5 text-xs md:text-sm text-gray-500 truncate">{s.label}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-center">
        <Link
          href="/statistiques"
          className="group inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-semibold hover:bg-brand-navy hover:text-white shadow-glow-soft hover:shadow-glow-navy transition-all"
        >
          Voir plus
          <ArrowUpRight
            className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            aria-hidden
          />
        </Link>
      </div>

      <p className="mt-3 text-xs text-gray-400 text-center max-w-3xl mx-auto">
        Les informations affichées sont basées sur les signalements et les expériences des
        utilisateurs, vérifiées lorsque cela est possible, et fournies à titre indicatif
        uniquement.
      </p>
    </section>
  );
}
