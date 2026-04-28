'use client';

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Siren,
  Clock,
  Gauge,
  Bell,
  BellRing,
  Sparkles,
  RotateCw,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import { useFollowContact } from '@/lib/useFollowContact';

type Props = {
  query: string;
  /** Contact type id (telephone / whatsapp / email / …). Stored
   * alongside the query in the follow list so the Mes alertes page
   * later knows how to render the followed contact. */
  contactType: string;
  /** Optional callback when the user clicks "Vérifier un autre contact".
   * The host (HomeHero) clears its input + scrolls the search section
   * back into view so the user can immediately start the next query. */
  onAgain?: () => void;
};

type RiskLevel = 'faible' | 'vigilance' | 'modere' | 'eleve';

type RiskConfig = {
  // Three i18n keys per risk level — pulled from messages.ts so the
  // verdict, the headline pill, and the bottom message all switch
  // languages together.
  labelKey: string;
  pillKey: string;
  messageKey: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  dotIndex: number;
  Icon: LucideIcon;
  iconAnim: string;
  pillAnim: string;
  pillGlow: string;
  cardAuraBg: string;
};

// Owner-confirmed labels (April 26 2026):
//   Faible    → "Aucun signalement détecté"
//   Vigilance → "Des signalements ont été détectés"
//   Modéré    → "Plusieurs signalements ont été détectés"
//   Élevé     → "Plusieurs signalements ont été détectés"   (same as modéré)
//
// Bottom-message variants:
//   Faible    → "Aucun signalement détecté. Vérifiez avant de poursuivre."
//   Vigilance → "Un signalement a été enregistré. Vérifiez avant de poursuivre."
//   Modéré +
//   Élevé     → "Des signalements ont été enregistrés. Vérifiez avant de poursuivre."
const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  faible: {
    labelKey: 'home.searchResult.risk.faible.label',
    pillKey: 'home.searchResult.risk.faible.pill',
    messageKey: 'home.searchResult.risk.faible.message',
    pillBg: 'bg-green-100',
    pillText: 'text-green-700',
    pillBorder: 'border-green-500/40',
    dotIndex: 0,
    Icon: CheckCircle2,
    iconAnim: 'animate-sparkle-pop',
    pillAnim: 'animate-verify-pulse',
    pillGlow: 'shadow-glow-green',
    cardAuraBg: 'bg-green-500/15',
  },
  vigilance: {
    labelKey: 'home.searchResult.risk.vigilance.label',
    pillKey: 'home.searchResult.risk.vigilance.pill',
    messageKey: 'home.searchResult.risk.vigilance.message',
    pillBg: 'bg-yellow-100',
    pillText: 'text-yellow-500',
    pillBorder: 'border-yellow-500/50',
    dotIndex: 1,
    Icon: AlertCircle,
    iconAnim: 'animate-sparkle-pop',
    pillAnim: 'animate-pulse-yellow',
    pillGlow: 'shadow-glow-yellow',
    cardAuraBg: 'bg-yellow-300/20',
  },
  modere: {
    labelKey: 'home.searchResult.risk.modere.label',
    pillKey: 'home.searchResult.risk.modere.pill',
    messageKey: 'home.searchResult.risk.modere.message',
    pillBg: 'bg-orange-100',
    pillText: 'text-orange-500',
    pillBorder: 'border-orange-500/50',
    dotIndex: 2,
    Icon: AlertTriangle,
    iconAnim: 'animate-siren-wiggle',
    pillAnim: 'animate-pulse-orange',
    pillGlow: 'shadow-glow-orange',
    cardAuraBg: 'bg-orange-500/20',
  },
  eleve: {
    labelKey: 'home.searchResult.risk.eleve.label',
    pillKey: 'home.searchResult.risk.eleve.pill',
    messageKey: 'home.searchResult.risk.eleve.message',
    pillBg: 'bg-red-100',
    pillText: 'text-red-700',
    pillBorder: 'border-red-500/50',
    dotIndex: 3,
    Icon: AlertOctagon,
    iconAnim: 'animate-siren-wiggle',
    pillAnim: 'animate-alert-pulse',
    pillGlow: 'shadow-glow-red',
    cardAuraBg: 'bg-red-500/20',
  },
};

const DOT_COLORS = ['bg-green-500', 'bg-yellow-300', 'bg-orange-500', 'bg-red-500'];

// i18n keys for the 4 fraud-category KPI cards. Resolved at render
// time so the labels follow the active locale.
const KPI_LABEL_KEYS = [
  'home.searchResult.kpi.nonDelivery',
  'home.searchResult.kpi.blockedAfterPayment',
  'home.searchResult.kpi.nonCompliant',
  'home.searchResult.kpi.identityTheft',
];

type DemoData = {
  risk: RiskLevel;
  reports: number;
  kpis: number[];
  // Hours since the last signalement. null = no signalement at all.
  lastReportedHoursAgo: number | null;
};

// Demo mapping (until /api/search lands). Counts respect the owner spec:
//   0 reports     → faible
//   1-2 reports   → vigilance
//   3-4 reports   → modéré
//   5+ reports    → élevé
const DEMO: Record<string, DemoData> = {
  'info@mushtarik.com': {
    risk: 'faible',
    reports: 0,
    kpis: [0, 0, 0, 0],
    lastReportedHoursAgo: null,
  },
  'info@mushtarik01.com': {
    risk: 'vigilance',
    reports: 2,
    kpis: [1, 0, 1, 0],
    lastReportedHoursAgo: 12,
  },
  'info@mushtarik02.com': {
    risk: 'modere',
    reports: 4,
    kpis: [2, 1, 1, 0],
    lastReportedHoursAgo: 24 * 5,
  },
  'info@mushtarik03.com': {
    risk: 'eleve',
    reports: 12,
    kpis: [5, 3, 2, 2],
    lastReportedHoursAgo: 24 * 21,
  },
};

function getDemo(query: string): DemoData {
  const normalized = query.trim().toLowerCase();
  return DEMO[normalized] ?? DEMO['info@mushtarik.com']!;
}

// Owner-spec relative-time formatter:
//   < 1h          → "à l'instant"
//   1-23h         → "il y a 1 heure" / "il y a X heures"
//   24-47h        → "hier"
//   2-6 jours     → "il y a X jours"
//   7-29 jours    → "il y a 1 semaine" / "il y a X semaines"
//   30-364 jours  → "il y a 1 mois" / "il y a X mois"
//   365+ jours    → "il y a 1 an" / "il y a X ans"
// Localised relative-time formatter — same buckets as before but
// each branch goes through t() with a {n} interpolation so the
// wording follows the active locale.
function useFormatRelativeTime() {
  const { t } = useI18n();
  return (hoursAgo: number): string => {
    if (hoursAgo < 1) return t('home.searchResult.time.now');
    if (hoursAgo < 24) {
      const h = Math.round(hoursAgo);
      return h === 1
        ? t('home.searchResult.time.hour')
        : t('home.searchResult.time.hours', { n: h });
    }
    const days = Math.floor(hoursAgo / 24);
    if (days < 2) return t('home.searchResult.time.yesterday');
    if (days < 7) return t('home.searchResult.time.days', { n: days });
    if (days < 30) {
      const w = Math.floor(days / 7);
      return w === 1
        ? t('home.searchResult.time.week')
        : t('home.searchResult.time.weeks', { n: w });
    }
    if (days < 365) {
      const m = Math.floor(days / 30);
      return m === 1
        ? t('home.searchResult.time.month')
        : t('home.searchResult.time.months', { n: m });
    }
    const y = Math.floor(days / 365);
    return y === 1
      ? t('home.searchResult.time.year')
      : t('home.searchResult.time.years', { n: y });
  };
}

export function SearchResult({ query, contactType, onAgain }: Props) {
  const { t } = useI18n();
  const formatRelativeTime = useFormatRelativeTime();
  const demo = getDemo(query);
  const cfg = RISK_CONFIG[demo.risk];
  const Icon = cfg.Icon;
  // Per-contact follow state — persisted in localStorage via the
  // useFollowContact hook so the same contact stays followed across
  // page reloads / surfaces.
  const { followed, toggle: toggleFollow, hydrated } = useFollowContact(query, contactType);
  const reportLabel = t(
    demo.reports === 1
      ? 'home.searchResult.report.singular'
      : 'home.searchResult.report.plural',
  );

  const lastReportText =
    demo.lastReportedHoursAgo !== null
      ? `${t('home.searchResult.lastReportPrefix')} ${formatRelativeTime(demo.lastReportedHoursAgo)}`
      : t('home.searchResult.noRecentReport');

  return (
    <div
      key={demo.risk}
      className="mt-8 pt-8 border-t border-gray-200/70 animate-fade-in-down relative isolate"
      aria-label={t('home.searchResult.aria')}
    >
      <p className="sr-only">{t('home.searchResult.aria.queryFor', { query })}</p>

      {/* Risk-coloured aura behind the whole result block — two
          stacked layers that breathe at slightly different paces so
          the wash never feels static, plus a third low-opacity layer
          drifting behind for extra depth. The eye picks up the
          verdict colour before reading any text. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-6 rounded-[2.5rem] ${cfg.cardAuraBg} blur-3xl animate-result-breath -z-10`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-2 rounded-[2rem] ${cfg.cardAuraBg} blur-2xl opacity-50 animate-result-breath -z-10`}
        style={{ animationDelay: '1.5s' }}
      />

      {/* Headline pill — first in the cascade entrance: pops in with a
          short delay so the user perceives the verdict landing before
          the rest of the card unfolds. */}
      <div
        className="flex justify-center mb-4 animate-fade-in-down"
        style={{ animationDelay: '0ms', animationFillMode: 'both' }}
      >
        <div
          className={`inline-flex items-center gap-2 rounded-pill ${cfg.pillBg} ${cfg.pillText} border ${cfg.pillBorder} px-4 py-2 text-sm font-semibold ${cfg.pillGlow} ${cfg.pillAnim}`}
        >
          <Icon className={`h-4 w-4 ${cfg.iconAnim}`} aria-hidden />
          {t(cfg.pillKey)}
        </div>
      </div>

      {/* Info row — three FROSTED-GLASS tiles. Each card is highly
          transparent so the parent banner gradient (white →
          brand-sky) shows through, with a subtle brand-blue glass
          tint: thin brand-blue ring, soft inner highlight, light
          backdrop blur. Content is centered + bold so the verdict
          KPIs read clearly even with the airy glass surface. The row
          stays NARROWER than the 4 KPI cards underneath so it reads
          as a lightweight summary, not a duplicate of the KPI grid. */}
      <div className="mx-auto max-w-3xl grid gap-2.5 sm:grid-cols-3 mb-6">
        <article
          className="group relative h-full rounded-xl bg-white/30 backdrop-blur-md ring-1 ring-brand-blue/25 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.55),0_3px_12px_-6px_rgb(0_120_186_/_0.18)] px-3 py-2.5 flex items-center justify-center gap-2 hover:bg-white/45 hover:ring-brand-blue/40 hover:-translate-y-0.5 transition-all duration-300 ease-out animate-fade-in-down overflow-hidden"
          style={{ animationDelay: '120ms', animationFillMode: 'both' }}
        >
          {/* Diagonal glass sheen — subtle white wash from top-left
              that gives each tile a real glass feel without darkening
              the surface. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl"
          />
          <span
            aria-hidden
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/25 group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-300"
          >
            <Siren className="h-4 w-4 animate-sparkle-pop" />
          </span>
          <p className="relative text-xl font-extrabold tabular-nums leading-none bg-grad-stat-navy bg-clip-text text-transparent">
            {demo.reports}
          </p>
          <p className="relative text-xs font-bold text-brand-navy whitespace-nowrap">
            {reportLabel}
          </p>
        </article>

        <article
          className="group relative h-full rounded-xl bg-white/30 backdrop-blur-md ring-1 ring-brand-blue/25 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.55),0_3px_12px_-6px_rgb(0_120_186_/_0.18)] px-3 py-2.5 flex items-center justify-center gap-2 hover:bg-white/45 hover:ring-brand-blue/40 hover:-translate-y-0.5 transition-all duration-300 ease-out animate-fade-in-down overflow-hidden"
          style={{ animationDelay: '180ms', animationFillMode: 'both' }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl"
          />
          <span
            aria-hidden
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/25 group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-300"
          >
            <Clock className="h-4 w-4 animate-sparkle-pop" />
          </span>
          <p className="relative text-xs font-bold text-brand-navy leading-tight">
            {lastReportText}
          </p>
        </article>

        <article
          className="group relative h-full rounded-xl bg-white/30 backdrop-blur-md ring-1 ring-brand-blue/25 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.55),0_3px_12px_-6px_rgb(0_120_186_/_0.18)] px-3 py-2.5 flex items-center justify-center gap-2 hover:bg-white/45 hover:ring-brand-blue/40 hover:-translate-y-0.5 transition-all duration-300 ease-out animate-fade-in-down overflow-hidden"
          style={{ animationDelay: '240ms', animationFillMode: 'both' }}
          aria-label={t('home.searchResult.aria.riskLevel', { label: t(cfg.labelKey) })}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl"
          />
          <span
            aria-hidden
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/25 group-hover:scale-110 group-hover:rotate-[-4deg] transition-transform duration-300"
          >
            <Gauge className="h-4 w-4 animate-sparkle-pop" />
          </span>
          <p className="relative text-xs font-bold text-brand-navy whitespace-nowrap">
            {t('home.searchResult.risk.prefix')}{' '}
            <span className={`font-extrabold capitalize ${cfg.pillText}`}>
              {t(cfg.labelKey)}
            </span>
          </p>
          {/* Risk dots — bumped from h-1.5 to h-3 so they read
              clearly. The active dot adds a coloured glow ring + an
              extra ping pulse on top of the existing animate-ping
              halo so it really FLASHES instead of being a quiet
              bullet. Inactive dots get bumped to opacity-50 (was 25)
              so the row is visibly a 4-step gauge. */}
          <span className="relative flex items-center gap-1">
            {DOT_COLORS.map((color, i) => {
              const isActive = i === cfg.dotIndex;
              return (
                <span
                  key={color}
                  className={`relative h-2.5 w-2.5 rounded-full ${color} ${
                    isActive
                      ? `ring-2 ring-white shadow-[0_0_10px_2px_currentColor] animate-pulse ${cfg.pillText}`
                      : 'opacity-50'
                  }`}
                >
                  {isActive && (
                    <>
                      <span
                        aria-hidden
                        className={`absolute inset-0 rounded-full ${color} animate-ping opacity-75`}
                      />
                      <span
                        aria-hidden
                        className={`absolute -inset-1 rounded-full ${color} animate-ping opacity-30`}
                        style={{ animationDelay: '300ms' }}
                      />
                    </>
                  )}
                </span>
              );
            })}
          </span>
        </article>
      </div>

      {/* Follow button moved to the bottom row — see the action bar
          right after the bottom message; it now sits next to
          "Vérifier un autre contact" with a vertical separator. */}

      {/* KPI cards — number rendered with the brand-navy → brand-blue
          gradient (bg-clip-text) so the figure pops with the platform
          identity instead of generic black. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPI_LABEL_KEYS.map((labelKey, i) => (
          <div
            key={labelKey}
            className="group rounded-2xl bg-white border border-gray-200 p-5 text-center shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-1 hover:border-brand-blue/40 transition-all duration-300 ease-out animate-fade-in-down"
            // Cascade the 4 KPI cards in 80 ms steps starting at 360 ms,
            // i.e. AFTER the headline pill, info chips and follow CTA
            // have already landed — feels like the verdict computes
            // section by section.
            style={{
              animationDelay: `${360 + i * 80}ms`,
              animationFillMode: 'both',
            }}
          >
            <p className="text-4xl font-bold tabular-nums bg-grad-stat-navy bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {demo.kpis[i] ?? 0}
            </p>
            <p className="mt-1 text-sm text-gray-500 group-hover:text-brand-navy transition-colors">
              {t(labelKey)}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom message — risk-coloured pill with a shimmer light passing
          across so it reads as freshly computed. Pill style mirrors the
          headline pill so the section feels framed by the same colour
          on top and bottom. Lands AFTER the KPI cascade (≈740 ms).*/}
      <div
        className="mt-6 flex justify-center animate-fade-in-down"
        style={{ animationDelay: '740ms', animationFillMode: 'both' }}
      >
        <span
          key={`msg-${demo.risk}`}
          className={`relative inline-flex items-center rounded-pill ${cfg.pillBg} ${cfg.pillText} border ${cfg.pillBorder} px-5 py-2.5 text-sm font-semibold ${cfg.pillGlow} overflow-hidden`}
        >
          <span className="relative z-10">{t(cfg.messageKey)}</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
          />
        </span>
      </div>

      {/* Action row — "Suivre ce contact" + "Vérifier un autre
          contact" side by side, both painted in the brand-navy →
          brand-blue gradient (charter) so the CTAs read as the
          single official next step regardless of the verdict.
          - Wrap on mobile (flex-wrap), separator hidden when stacked.
          - Both buttons share the same gradient, shadow-glow-blue
            and animate-pulse-blue halo so they pulse in unison.
          - Lands last in the cascade so it reads as the natural
            next step once the verdict is in. */}
      <div
        className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-fade-in-down"
        style={{ animationDelay: '860ms', animationFillMode: 'both' }}
      >
        {hydrated && (
          <button
            type="button"
            onClick={toggleFollow}
            aria-pressed={followed}
            className="group relative overflow-hidden inline-flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-navy via-brand-blue to-brand-blue text-white shadow-glow-blue animate-pulse-blue px-6 py-2.5 text-sm font-semibold hover:scale-[1.04] hover:[animation-play-state:paused] transition-all duration-300 ease-out"
          >
            {followed ? (
              <BellRing className="h-4 w-4 animate-siren-wiggle" aria-hidden />
            ) : (
              <Bell className="h-4 w-4 group-hover:animate-sparkle-pop" aria-hidden />
            )}
            <span className="relative z-10">
              {followed
                ? t('home.searchResult.follow.followed')
                : t('home.searchResult.follow.follow')}
            </span>
            {/* Shimmer wipe across the button on hover. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer rounded-pill"
            />
          </button>
        )}

        {/* Vertical separator — only between the two buttons on
            wide screens; collapses cleanly when they stack on mobile. */}
        <span
          aria-hidden
          className="hidden sm:inline-block h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"
        />

        <button
          type="button"
          onClick={() => {
            if (onAgain) {
              onAgain();
            } else if (typeof window !== 'undefined') {
              const target = document.getElementById('recherche');
              if (target) {
                const y = target.getBoundingClientRect().top + window.scrollY - 88;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }
          }}
          className="group relative overflow-hidden inline-flex items-center gap-2 rounded-pill bg-gradient-to-r from-brand-navy via-brand-blue to-brand-blue text-white shadow-glow-blue animate-pulse-blue px-6 py-2.5 text-sm font-semibold hover:scale-[1.04] hover:[animation-play-state:paused] transition-all duration-300 ease-out"
        >
          <RotateCw
            className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180"
            aria-hidden
          />
          <span className="relative z-10">{t('home.searchResult.again')}</span>
          {/* Shimmer wipe across the button on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer rounded-pill"
          />
        </button>
      </div>

      <div
        className="mt-3 flex justify-center animate-fade-in-down"
        style={{ animationDelay: '960ms', animationFillMode: 'both' }}
      >

        {/* Trust strip — tiny static social-proof line so the user
            sees that "vérifier" is a worthwhile, frequent action.
            Three icons, three counters, all tinted navy. */}
        <p className="inline-flex items-center gap-3 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-600 animate-sparkle-pop" aria-hidden />
            {t('home.searchResult.trust.encrypted')}
          </span>
          <span aria-hidden className="text-gray-300">·</span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand-blue animate-sparkle-pop" aria-hidden />
            {t('home.searchResult.trust.live')}
          </span>
          <span aria-hidden className="text-gray-300">·</span>
          <span className="inline-flex items-center gap-1">
            <Bell className="h-3 w-3 text-orange-500 animate-sparkle-pop" aria-hidden />
            {t('home.searchResult.trust.alerts')}
          </span>
        </p>
      </div>
    </div>
  );
}
