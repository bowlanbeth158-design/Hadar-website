'use client';

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Siren,
  Clock,
  Gauge,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';

type Props = {
  query: string;
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

export function SearchResult({ query }: Props) {
  const { t } = useI18n();
  const formatRelativeTime = useFormatRelativeTime();
  const demo = getDemo(query);
  const cfg = RISK_CONFIG[demo.risk];
  const Icon = cfg.Icon;
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

      {/* Risk-coloured aura behind the whole result block — soft blur,
          tint the section in the matching risk colour so the eye picks
          up the verdict before reading any text. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-4 rounded-[2rem] ${cfg.cardAuraBg} blur-3xl opacity-80 -z-10`}
      />

      {/* Headline pill */}
      <div className="flex justify-center mb-4">
        <div
          className={`inline-flex items-center gap-2 rounded-pill ${cfg.pillBg} ${cfg.pillText} border ${cfg.pillBorder} px-4 py-2 text-sm font-semibold ${cfg.pillGlow} ${cfg.pillAnim}`}
        >
          <Icon className={`h-4 w-4 ${cfg.iconAnim}`} aria-hidden />
          {t(cfg.pillKey)}
        </div>
      </div>

      {/* Info row — three pill chips so the verdict reads at a glance:
            (1) report count with a Siren icon, count in brand-navy
                gradient bold so the number is the visual anchor.
            (2) last-report time with a Clock icon.
            (3) Risk level with the 4 dot indicator + a Gauge icon,
                tinted by the risk colour and a soft pulse on the
                active dot.
          Each chip sits on a backdrop-blurred white surface with a
          brand-blue ring + glow so they pop against the page wash. */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <span className="inline-flex items-center gap-2 rounded-pill bg-white/80 backdrop-blur-sm border border-brand-blue/20 px-3.5 py-1.5 text-sm shadow-glow-soft">
          <span
            aria-hidden
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20"
          >
            <Siren className="h-3.5 w-3.5" />
          </span>
          <span className="font-bold text-base tabular-nums bg-grad-stat-navy bg-clip-text text-transparent">
            {demo.reports}
          </span>
          <span className="text-gray-600">{reportLabel}</span>
        </span>

        <span className="inline-flex items-center gap-2 rounded-pill bg-white/80 backdrop-blur-sm border border-brand-blue/20 px-3.5 py-1.5 text-sm shadow-glow-soft">
          <span
            aria-hidden
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20"
          >
            <Clock className="h-3.5 w-3.5" />
          </span>
          <span className="text-gray-700">{lastReportText}</span>
        </span>

        <span
          className={`inline-flex items-center gap-2 rounded-pill bg-white/80 backdrop-blur-sm border ${cfg.pillBorder} px-3.5 py-1.5 text-sm shadow-glow-soft`}
          aria-label={t('home.searchResult.aria.riskLevel', { label: t(cfg.labelKey) })}
        >
          <span
            aria-hidden
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${cfg.pillBg} ${cfg.pillText} ring-1 ${cfg.pillBorder}`}
          >
            <Gauge className="h-3.5 w-3.5" />
          </span>
          <span className="text-gray-600">{t('home.searchResult.risk.prefix')}</span>
          <span className={`${cfg.pillText} font-semibold capitalize`}>{t(cfg.labelKey)}</span>
          <span className="flex items-center gap-1 ml-0.5">
            {DOT_COLORS.map((color, i) => {
              const isActive = i === cfg.dotIndex;
              return (
                <span
                  key={color}
                  className={`relative h-2 w-2 rounded-full ${color} ${
                    isActive ? 'shadow-md' : 'opacity-25'
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className={`absolute inset-0 rounded-full ${color} animate-ping opacity-60`}
                    />
                  )}
                </span>
              );
            })}
          </span>
        </span>
      </div>

      {/* KPI cards — number rendered with the brand-navy → brand-blue
          gradient (bg-clip-text) so the figure pops with the platform
          identity instead of generic black. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_LABEL_KEYS.map((labelKey, i) => (
          <div
            key={labelKey}
            className="rounded-2xl bg-white border border-gray-200 p-5 text-center shadow-glow-soft"
          >
            <p className="text-4xl font-bold tabular-nums bg-grad-stat-navy bg-clip-text text-transparent">
              {demo.kpis[i] ?? 0}
            </p>
            <p className="mt-1 text-sm text-gray-500">{t(labelKey)}</p>
          </div>
        ))}
      </div>

      {/* Bottom message — risk-coloured pill with a shimmer light passing
          across so it reads as freshly computed. Pill style mirrors the
          headline pill so the section feels framed by the same colour
          on top and bottom. */}
      <div className="mt-6 flex justify-center">
        <span
          key={`msg-${demo.risk}`}
          className={`relative inline-flex items-center rounded-pill ${cfg.pillBg} ${cfg.pillText} border ${cfg.pillBorder} px-5 py-2.5 text-sm font-semibold ${cfg.pillGlow} overflow-hidden animate-fade-in-down`}
        >
          <span className="relative z-10">{t(cfg.messageKey)}</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
          />
        </span>
      </div>
    </div>
  );
}
