import Link from 'next/link';
import {
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Star,
  BellRing,
  ArrowUp,
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { CountUp } from './CountUp';
import { OFFICIAL_LOGO_URL } from './Logo';

// URL postimg de la photo ambassadeur Hadar.
const AMBASSADOR_IMAGE_URL = 'https://i.postimg.cc/Y0V7C7w3/Hadar-man.png';

// 4 visages des "utilisateurs rassurés" (carte flottante top-right).
// Ordre = ordre d'affichage gauche → droite (avec léger overlap).
const RASSURES_AVATARS: { src: string; alt: string }[] = [
  { src: 'https://i.postimg.cc/yN5fHvTh/Image-fx-2026-04-26T230722-953.jpg', alt: '' },
  { src: 'https://i.postimg.cc/RVsKyqdb/Image-fx-2026-04-26T230243-224.jpg', alt: '' },
  { src: 'https://i.postimg.cc/Y9rStzqR/Image-fx-2026-04-26T230433-696.jpg', alt: '' },
  { src: 'https://i.postimg.cc/9Frr4bPY/Image-fx-2026-04-26T230922-356.jpg', alt: '' },
];

// Pro hover effect shared by the 3 floating cards — pauses the soft
// float, lifts the card 2px, scales it 3%, swaps the soft halo for a
// stronger brand-blue glow. Smooth 300 ms easeOut.
const FLOAT_CARD_HOVER =
  'transition-all duration-300 ease-out cursor-default ' +
  'hover:-translate-y-1 hover:scale-[1.03] hover:shadow-glow-blue ' +
  'hover:[animation-play-state:paused]';

// Live verifications stats — 30-day rolling window. Wired to the
// /api/stats endpoint when the backend lands; for now these are
// mock values. Set `trendPercent` negative to flip the badge to red
// + a downward animated arrow.
const STATS_30D = {
  verifications: 3247,
  trendPercent: 18,
};

// Live alert counts shown on Card 3. The halo at the bottom-right
// dynamically tints itself with the colour of whichever risk level
// has the most signalements today.
type AlertRisk = 'vigilance' | 'moderee' | 'elevee';
const ALERTS_TODAY: Record<AlertRisk, number> = {
  vigilance: 2,
  moderee: 4,
  elevee: 1,
};
const HALO_BY_TOP_RISK: Record<AlertRisk, string> = {
  vigilance:
    'bg-gradient-to-br from-yellow-200/55 via-yellow-300/45 to-yellow-400/35',
  moderee:
    'bg-gradient-to-br from-orange-200/55 via-orange-400/45 to-orange-500/35',
  elevee:
    'bg-gradient-to-br from-red-200/55 via-red-400/45 to-red-500/35',
};
function topRisk(counts: Record<AlertRisk, number>): AlertRisk {
  let top: AlertRisk = 'vigilance';
  if (counts.moderee > counts[top]) top = 'moderee';
  if (counts.elevee > counts[top]) top = 'elevee';
  return top;
}

const BULLETS = [
  '+10 000 vérifications',
  'Résultat immédiat',
  'Communauté marocaine',
  '100% confidentiel',
];

export function HomeBanner() {
  const dominantRisk = topRisk(ALERTS_TODAY);
  const haloClass = HALO_BY_TOP_RISK[dominantRisk];

  const trend = STATS_30D.trendPercent;
  const isPositiveTrend = trend >= 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
  const trendBadgeClass = isPositiveTrend
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';
  const trendIconAnim = isPositiveTrend ? 'animate-trend-up' : 'animate-trend-down';

  return (
    <section className="relative overflow-hidden">
      {/* Decorative background — moved to <body> in app/layout.tsx so every
          page shares the same atmospheric backdrop. The section itself is
          now transparent to let the global gradient + blurs show through. */}

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 pt-4 md:pt-6 pb-12 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* LEFT — copy + CTAs */}
        <div>
          {/* "Introducing"-style pill with animated icon, gradient bg
              and a shimmer line travelling left → right under it (5 s loop). */}
          <div className="inline-flex flex-col">
            <span className="relative inline-flex items-center gap-2 rounded-pill border border-white/70 bg-gradient-to-r from-brand-sky via-blue-100 to-brand-sky text-brand-navy px-4 py-1.5 text-xs font-semibold shadow-sm overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OFFICIAL_LOGO_URL}
                alt=""
                aria-hidden
                className="h-4 w-4 object-contain animate-sparkle-pop drop-shadow"
              />
              <span className="relative z-10">
                La plateforme marocaine de vérification des contacts
              </span>
              {/* Shimmer light passing across the pill background */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
              />
            </span>

            {/* Underline with travelling light spot — repeats every 5 s */}
            <div
              aria-hidden
              className="relative mt-2 h-[2px] overflow-hidden rounded-full bg-gradient-to-r from-transparent via-brand-sky to-transparent"
            >
              <span className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-brand-blue to-transparent animate-shimmer" />
            </div>
          </div>

          <h1 className="mt-8 md:mt-10 text-4xl md:text-6xl font-bold tracking-tight text-brand-navy leading-[1.05]">
            Avant d&apos;acheter,<br />
            <span className="bg-gradient-to-r from-brand-navy via-brand-blue to-sky-400 bg-clip-text text-transparent">
              vérifiez.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base md:text-lg text-gray-500">
            Plateforme de vérification des contacts. Prenez des décisions éclairées avant toute
            transaction.
          </p>

          <ul className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            {BULLETS.map((b, i) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-brand-navy">
                {/* 360° "flip" animation — every 6 s. Each badge spins in
                    the first ~2 s of its own cycle then rests; with a
                    1.5 s per-badge delay the spin ripples from left to
                    right across the four badges instead of firing all
                    at once. animate-badge-spin keyframe lives in
                    tailwind.config.ts. */}
                <VerifiedBadge
                  className="h-5 w-5 shrink-0 animate-badge-spin"
                  style={{ animationDelay: `${i * 1500}ms` }}
                />
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>

          {/* Live 30-day verifications callout — number + trend badge.
              Positive trend → green badge + animated up arrow.
              Negative trend → red badge + animated down arrow. */}
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <span className="text-4xl md:text-5xl font-bold text-brand-navy leading-none tabular-nums">
              <CountUp to={STATS_30D.verifications} duration={1500} />
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-bold tabular-nums ${trendBadgeClass}`}
            >
              <TrendIcon className={`h-3.5 w-3.5 ${trendIconAnim}`} aria-hidden />
              <CountUp
                to={trend}
                prefix={isPositiveTrend ? '+' : ''}
                suffix="%"
              />
            </span>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            vérifications utiles sur les 30 derniers jours.
          </p>

          {/* CTAs — same pulse + wiggle effect as the old header buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#recherche"
              className="inline-flex items-center gap-2 rounded-pill bg-green-500 hover:bg-green-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-green animate-verify-pulse hover:scale-[1.03] hover:[animation-play-state:paused] transition-all"
            >
              <ShieldCheck className="h-5 w-5 animate-siren-wiggle" aria-hidden />
              Vérifier maintenant
            </Link>
            <Link
              href="/signaler"
              className="inline-flex items-center gap-2 rounded-pill bg-red-500 hover:bg-red-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-red animate-alert-pulse hover:scale-[1.03] hover:[animation-play-state:paused] transition-all"
            >
              <Siren className="h-5 w-5 animate-siren-wiggle" aria-hidden />
              Partager une expérience
            </Link>
          </div>

          <p className="mt-8 md:mt-10 text-sm md:text-base text-gray-500">
            Sans inscription <span className="text-gray-300">•</span> Anonyme{' '}
            <span className="text-gray-300">•</span>{' '}
            <span className="font-semibold text-brand-navy">Plateforme marocaine 🇲🇦</span>
          </p>
        </div>

        {/* RIGHT — ambassador photo + floating product cards (Ultahost-style) */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-[4/5] max-w-xl">
            {/* Soft halo behind the person */}
            <div
              aria-hidden
              className="absolute inset-10 rounded-full bg-gradient-to-br from-brand-sky via-white to-brand-sky blur-2xl"
            />

            {/* Contact shadow at the bottom — oval, soft, anchored under the
                figure to give it a 3D ground feel. Sits behind the image so
                the image mask reveals it where the photo fades out. */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 w-3/5 h-14 rounded-[50%] bg-brand-navy/35 blur-2xl"
            />

            {/* Ambassador photo — Ultahost-style soft dissolve:
                two stacked copies of the image, the lower one heavily
                blurred so the bottom of the figure transitions
                sharp → blurry → transparent into the page bg. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AMBASSADOR_IMAGE_URL}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain object-top scale-110 origin-top blur-md opacity-80 [mask-image:linear-gradient(to_bottom,transparent_50%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_50%,black_70%,transparent_100%)]"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AMBASSADOR_IMAGE_URL}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-contain object-top scale-110 origin-top [mask-image:linear-gradient(to_bottom,black_60%,transparent_85%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_85%)]"
            />

            {/* Card 1 — Recherche instantanée (MID-LEFT, extends well outside)
                Brand-gradient panel with a decorative (non-functional)
                search bar — Ultahost-style intro card. */}
            <div
              className={`absolute top-[38%] -left-24 w-72 rounded-2xl border border-white/80 bg-gradient-to-br from-brand-sky/80 via-white to-brand-sky/30 shadow-glow-soft p-4 animate-float-soft ${FLOAT_CARD_HOVER}`}
              style={{ animationDelay: '0s' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-5 w-5 text-brand-blue drop-shadow-sm animate-sparkle-pop"
                  aria-hidden
                />
                <span className="text-base font-bold text-brand-navy">
                  Recherche instantanée
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">Vérifier un contact</p>

              {/* Decorative pill search bar — purely visual, not clickable */}
              <div
                aria-hidden
                className="mt-3 flex items-center gap-2 rounded-pill bg-white/90 backdrop-blur-sm border border-white shadow-sm px-3 py-2"
              >
                <span className="flex-1 text-xs text-gray-400">Numéro, email ou RIB…</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-navy to-brand-blue text-white shadow">
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                </span>
              </div>
            </div>

            {/* Card 2 — Utilisateurs rassurés (TOP-RIGHT, beside head).
                4 photos de visages réels (avec overlap de 8 px) + 5 étoiles
                qui s'allument séquentiellement (1 → 5) puis émettent un
                halo doré collectif. Fond gradient brand-sky pour matcher
                l'identité visuelle des autres cartes flottantes. */}
            <div
              className={`absolute top-4 -right-8 w-60 rounded-2xl border border-white/80 bg-gradient-to-br from-white via-brand-sky/40 to-brand-sky/70 shadow-glow-soft p-3.5 animate-float-soft ${FLOAT_CARD_HOVER}`}
              style={{ animationDelay: '1.5s' }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex -space-x-2">
                  {RASSURES_AVATARS.map((a, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={a.src}
                      alt={a.alt}
                      aria-hidden={a.alt === ''}
                      loading="lazy"
                      decoding="async"
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ))}
                </div>
                <div className="inline-flex items-center gap-0.5 animate-stars-flash">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300 animate-star-pop"
                      style={{ animationDelay: `${i * 0.15}s` }}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2.5 text-sm font-bold text-brand-navy leading-tight">
                Utilisateurs rassurés
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 tabular-nums">
                <CountUp to={300} duration={1800} prefix="+" /> recommandations partagées
              </p>
            </div>

            {/* Card 3 — Alertes aujourd'hui (BOTTOM-RIGHT, extends right) */}
            <div
              className={`absolute bottom-6 -right-10 w-72 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-4 animate-float-soft ${FLOAT_CARD_HOVER}`}
              style={{ animationDelay: '3s' }}
            >
              {/* Bottom-right gradient halo — tinted with the colour of the
                  risk level that has the highest count today (yellow for
                  Vigilance, orange for Modérée, red for Élevée). Pulses
                  slowly to match the "live alerts" feel. */}
              <div
                aria-hidden
                className={`pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full blur-3xl animate-pulse ${haloClass}`}
              />

              <div className="relative">
                <div className="pb-2 border-b border-gray-100 flex items-center gap-1.5">
                  <BellRing
                    className="h-4 w-4 text-brand-blue animate-sparkle-pop"
                    aria-hidden
                  />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Alertes aujourd&apos;hui
                  </span>
                </div>
                <ul className="mt-2.5 space-y-2.5 text-xs">
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-300 ring-2 ring-yellow-100" />
                      Vigilance
                    </span>
                    <span className="text-gray-500 tabular-nums">
                      — <CountUp to={ALERTS_TODAY.vigilance} />
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-100" />
                      Modérée
                    </span>
                    <span className="text-gray-500 tabular-nums">
                      — <CountUp to={ALERTS_TODAY.moderee} />
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-semibold text-brand-navy">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
                      Élevée
                    </span>
                    <span className="text-gray-500 tabular-nums">
                      — <CountUp to={ALERTS_TODAY.elevee} />
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
