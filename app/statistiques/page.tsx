'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Siren,
  Smartphone,
  ShieldCheck,
  Wallet,
  Clock,
  CreditCard,
  MessageCircle,
  AtSign,
  Globe,
  PackageX,
  Ban,
  AlertTriangle,
  VenetianMask,
  Hash,
  Percent,
  type LucideIcon,
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { StatsPeriodTabs, type Period } from '@/components/StatsPeriodTabs';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { AnimatedDonut } from '@/components/AnimatedDonut';
import { useCurrency } from '@/lib/currency/provider';
import { useI18n } from '@/lib/i18n/provider';

type DisplayMode = 'count' | 'percent';

// French number formatter — 1245 → "1 245"
function fmtCount(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ').replace(/ /g, ' ');
}

// fmtMAD removed — the "Montant signalé" KPI now goes through the
// CurrencyProvider's format() helper so it follows the active
// currency picked from the header switcher (MAD / EUR / USD).

function fmtBar(count: number, pct: number, mode: DisplayMode): string {
  return mode === 'count' ? fmtCount(count) : `${pct}%`;
}

type Snapshot = {
  global: {
    utilisateurs: number;
    signalements: number;
    contacts: number;
    verifications: number;
    montant: number;
    dernier: string;
  };
  problems: { count: number; pct: number }[];
  channels: { count: number; pct: number }[];
  activity: { count: number; pct: number }[];
  status:   { count: number }[];
  evolutionPct: number;
  evolutionThisCount: number;
  evolutionTodayCount: number;
  processingPct: number;
};

const LATEST_GLOBAL = 'il y a 12 min';
const LATEST_YESTERDAY = 'hier, 19:42';

const DATA: Record<Period, Snapshot> = {
  today: {
    global: {
      utilisateurs: 143,
      signalements: 37,
      contacts: 12,
      verifications: 512,
      montant: 14_200,
      dernier: LATEST_GLOBAL,
    },
    problems: [
      { count: 18, pct: 49 },
      { count: 9,  pct: 24 },
      { count: 6,  pct: 16 },
      { count: 2,  pct: 5  },
    ],
    channels: [
      { count: 13, pct: 36 },
      { count: 6,  pct: 16 },
      { count: 5,  pct: 14 },
      { count: 3,  pct: 8  },
    ],
    activity: [
      { count: 4,  pct: 11 },
      { count: 11, pct: 30 },
      { count: 30, pct: 81 },
      { count: 17, pct: 46 },
    ],
    status: [{ count: 65 }, { count: 22 }, { count: 41 }],
    evolutionPct: 8,
    evolutionThisCount: 65,
    evolutionTodayCount: 12,
    processingPct: 64,
  },
  yesterday: {
    global: {
      utilisateurs: 162,
      signalements: 42,
      contacts: 14,
      verifications: 580,
      montant: 18_400,
      dernier: LATEST_YESTERDAY,
    },
    problems: [
      { count: 21, pct: 50 },
      { count: 10, pct: 24 },
      { count: 6,  pct: 14 },
      { count: 2,  pct: 5  },
    ],
    channels: [
      { count: 15, pct: 36 },
      { count: 7,  pct: 17 },
      { count: 6,  pct: 14 },
      { count: 3,  pct: 7  },
    ],
    activity: [
      { count: 4,  pct: 10 },
      { count: 13, pct: 31 },
      { count: 33, pct: 79 },
      { count: 19, pct: 45 },
    ],
    status: [{ count: 72 }, { count: 25 }, { count: 47 }],
    evolutionPct: 5,
    evolutionThisCount: 72,
    evolutionTodayCount: 14,
    processingPct: 65,
  },
  week: {
    global: {
      utilisateurs: 884,
      signalements: 215,
      contacts: 78,
      verifications: 3_120,
      montant: 95_300,
      dernier: LATEST_GLOBAL,
    },
    problems: [
      { count: 107, pct: 50 },
      { count: 54,  pct: 25 },
      { count: 32,  pct: 15 },
      { count: 11,  pct: 5  },
    ],
    channels: [
      { count: 75,  pct: 35 },
      { count: 37,  pct: 17 },
      { count: 32,  pct: 15 },
      { count: 15,  pct: 7  },
    ],
    activity: [
      { count: 22, pct: 10 },
      { count: 65, pct: 30 },
      { count: 172, pct: 80 },
      { count: 97, pct: 45 },
    ],
    status: [{ count: 410 }, { count: 145 }, { count: 268 }],
    evolutionPct: 9,
    evolutionThisCount: 410,
    evolutionTodayCount: 78,
    processingPct: 65,
  },
  month: {
    global: {
      utilisateurs: 2_500,
      signalements: 1_245,
      contacts: 346,
      verifications: 15_000,
      montant: 420_000,
      dernier: LATEST_GLOBAL,
    },
    problems: [
      { count: 623, pct: 50 },
      { count: 311, pct: 25 },
      { count: 187, pct: 15 },
      { count: 62,  pct: 5  },
    ],
    channels: [
      { count: 436, pct: 35 },
      { count: 212, pct: 17 },
      { count: 187, pct: 15 },
      { count: 87,  pct: 7  },
    ],
    activity: [
      { count: 125,  pct: 10 },
      { count: 374,  pct: 30 },
      { count: 996,  pct: 80 },
      { count: 560,  pct: 45 },
    ],
    status: [{ count: 1_900 }, { count: 655 }, { count: 1_245 }],
    evolutionPct: 12,
    evolutionThisCount: 1_900,
    evolutionTodayCount: 345,
    processingPct: 65,
  },
};

const PROBLEM_LABELS: { labelKey: string; Icon: LucideIcon; gradient: string }[] = [
  { labelKey: 'statsPage.problem.nonDelivery',         Icon: PackageX,       gradient: 'bg-grad-stat-red'    },
  { labelKey: 'statsPage.problem.blockedAfterPayment', Icon: Ban,            gradient: 'bg-grad-stat-orange' },
  { labelKey: 'statsPage.problem.nonCompliant',        Icon: AlertTriangle,  gradient: 'bg-grad-alert-yellow'},
  { labelKey: 'statsPage.problem.identityTheft',       Icon: VenetianMask,   gradient: 'bg-grad-stat-violet' },
];

const CHANNEL_LABELS: {
  labelKey: string; Icon: LucideIcon; accent: string; badgeBg: string; cardGlow: string;
}[] = [
  { labelKey: 'statsPage.channel.rib',         Icon: CreditCard,    accent: 'border-orange-500', badgeBg: 'bg-grad-stat-orange', cardGlow: 'shadow-glow-orange' },
  { labelKey: 'statsPage.channel.whatsapp',    Icon: MessageCircle, accent: 'border-green-500',  badgeBg: 'bg-grad-stat-green',  cardGlow: 'shadow-glow-green'  },
  { labelKey: 'statsPage.channel.socialMedia', Icon: AtSign,        accent: 'border-violet-500', badgeBg: 'bg-grad-stat-violet', cardGlow: 'shadow-glow-violet' },
  { labelKey: 'statsPage.channel.website',     Icon: Globe,         accent: 'border-brand-blue', badgeBg: 'bg-grad-stat-navy',   cardGlow: 'shadow-glow-blue'   },
];

const ACTIVITY_LABELS: { labelKey: string; gradient: string }[] = [
  { labelKey: 'statsPage.activity.faible',    gradient: 'bg-grad-stat-navy'    },
  { labelKey: 'statsPage.activity.vigilance', gradient: 'bg-grad-alert-yellow' },
  { labelKey: 'statsPage.activity.modere',    gradient: 'bg-grad-stat-orange'  },
  { labelKey: 'statsPage.activity.eleve',     gradient: 'bg-grad-stat-red'     },
];

const STATUS_LABELS: { labelKey: string; color: string; glow: string }[] = [
  { labelKey: 'statsPage.status.submitted', color: 'bg-grad-stat-orange', glow: 'shadow-glow-orange' },
  { labelKey: 'statsPage.status.rejected',  color: 'bg-grad-stat-navy',   glow: 'shadow-glow-soft'   },
  { labelKey: 'statsPage.status.published', color: 'bg-grad-stat-green',  glow: 'shadow-glow-green'  },
];

const CHART_CARD =
  'rounded-2xl bg-gradient-to-br from-brand-sky/30 via-white to-brand-sky/35 backdrop-blur-sm border border-white/70 p-6 shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-0.5 transition-all duration-300 ease-out';

// AnimatedBar — reliably plays a 0 → pct% width tween every time the
// `trigger` prop changes (period switch / count↔% toggle).
//
// The trick is to disable the CSS transition on the snap-to-0 phase
// (otherwise the bar would smoothly shrink from its current pct to 0
// over 1 s, half-cancelling the animation we want). Two-phase render:
//   phase = 'idle'      → width = 0%, NO transition (instant snap)
//   phase = 'animating' → width = pct%, transition enabled (smooth fill)
function AnimatedBar({
  pct,
  gradient,
  trigger,
}: {
  pct: number;
  gradient: string;
  trigger: string;
}) {
  const [phase, setPhase] = useState<'idle' | 'animating'>('idle');

  useEffect(() => {
    setPhase('idle');
    const timer = setTimeout(() => setPhase('animating'), 40);
    return () => clearTimeout(timer);
  }, [pct, trigger]);

  return (
    <div className="h-2 rounded-pill bg-white/60 overflow-hidden border border-white/50">
      <div
        style={{
          width: phase === 'idle' ? '0%' : `${pct}%`,
          transition: phase === 'idle' ? 'none' : 'width 1s ease-out',
        }}
        className={`h-full rounded-pill ${gradient}`}
      />
    </div>
  );
}

// AnimatedColumn — same two-phase trick as AnimatedBar but for height,
// so the activity histogram bars grow bottom → top on every trigger
// change without the half-cancelled-shrink artefact.
function AnimatedColumn({
  pct,
  gradient,
  trigger,
}: {
  pct: number;
  gradient: string;
  trigger: string;
}) {
  const [phase, setPhase] = useState<'idle' | 'animating'>('idle');

  useEffect(() => {
    setPhase('idle');
    const timer = setTimeout(() => setPhase('animating'), 40);
    return () => clearTimeout(timer);
  }, [pct, trigger]);

  return (
    <div
      style={{
        height: phase === 'idle' ? '0%' : `${pct}%`,
        transition: phase === 'idle' ? 'none' : 'height 1s ease-out, filter 300ms',
      }}
      className={`w-full ${gradient} rounded-t-xl shadow-md group-hover:brightness-110 group-hover:shadow-lg`}
    />
  );
}

// Compact icon-only Nombre / % toggle.
function DisplayModeToggle({
  value,
  onChange,
}: {
  value: DisplayMode;
  onChange: (m: DisplayMode) => void;
}) {
  const { t } = useI18n();
  return (
    <div
      role="tablist"
      aria-label={t('statsPage.toggle.aria')}
      className="inline-flex items-center rounded-pill bg-white/70 backdrop-blur-sm border border-white/80 p-0.5 shadow-sm"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'count'}
        onClick={() => onChange('count')}
        title={t('statsPage.toggle.count')}
        aria-label={t('statsPage.toggle.count')}
        className={
          value === 'count'
            ? 'inline-flex items-center justify-center h-7 w-7 rounded-pill bg-grad-stat-navy text-white shadow-glow-navy'
            : 'inline-flex items-center justify-center h-7 w-7 rounded-pill text-brand-navy/70 hover:text-brand-navy transition-colors'
        }
      >
        <Hash className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'percent'}
        onClick={() => onChange('percent')}
        title={t('statsPage.toggle.percent')}
        aria-label={t('statsPage.toggle.percent')}
        className={
          value === 'percent'
            ? 'inline-flex items-center justify-center h-7 w-7 rounded-pill bg-grad-stat-navy text-white shadow-glow-navy'
            : 'inline-flex items-center justify-center h-7 w-7 rounded-pill text-brand-navy/70 hover:text-brand-navy transition-colors'
        }
      >
        <Percent className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

function ChartHeader({
  title,
  mode,
  setMode,
}: {
  title: string;
  mode?: DisplayMode;
  setMode?: (m: DisplayMode) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
      {mode !== undefined && setMode !== undefined && (
        <DisplayModeToggle value={mode} onChange={setMode} />
      )}
    </div>
  );
}

export default function Page() {
  const [period, setPeriod] = useState<Period>('month');

  const [problemsMode, setProblemsMode] = useState<DisplayMode>('count');
  const [channelsMode, setChannelsMode] = useState<DisplayMode>('count');
  const [activityMode, setActivityMode] = useState<DisplayMode>('count');

  // Currency-aware formatter — same provider as the homepage KPI,
  // so both surfaces stay in lock-step when the user toggles
  // currencies in the header.
  const { format: formatCurrency } = useCurrency();
  const { t } = useI18n();

  const data = DATA[period];

  const problemsTrigger = `${period}-${problemsMode}`;
  const channelsTrigger = `${period}-${channelsMode}`;
  const activityTrigger = `${period}-${activityMode}`;

  // KPI cards — labels reuse the same i18n keys as the homepage stats
  // so a translation update in messages.ts cascades to both surfaces.
  // Visual recipe matches PlatformStats on the home: a unified
  // sky-gradient surface with a small accent chip per metric (icon
  // tinted in the metric colour) plus a per-card travelling
  // spotlight halo that ripples through the row, instead of the
  // older approach where each card was flooded with its own
  // colour.
  type GlobalCard = {
    labelKey: string;
    value: string;
    Icon: LucideIcon;
    chip: { bg: string; text: string; ring: string; halo: string };
    spotlight: { ring: string; glow: string };
  };
  const globalCards: GlobalCard[] = [
    {
      labelKey: 'home.platformStats.kpi.usersActive',
      value: fmtCount(data.global.utilisateurs),
      Icon: Users,
      chip: { bg: 'bg-brand-navy/10', text: 'text-brand-navy', ring: 'ring-brand-navy/25', halo: 'bg-brand-navy/35' },
      spotlight: { ring: 'rgba(0, 50, 125, 0.50)', glow: 'rgba(0, 50, 125, 0.55)' },
    },
    {
      labelKey: 'home.platformStats.kpi.reportsLogged',
      value: fmtCount(data.global.signalements),
      Icon: Siren,
      chip: { bg: 'bg-red-500/10', text: 'text-red-500', ring: 'ring-red-500/25', halo: 'bg-red-500/35' },
      spotlight: { ring: 'rgba(238, 68, 68, 0.50)', glow: 'rgba(238, 68, 68, 0.55)' },
    },
    {
      labelKey: 'home.platformStats.kpi.contactsReported',
      value: fmtCount(data.global.contacts),
      Icon: Smartphone,
      chip: { bg: 'bg-violet-500/10', text: 'text-violet-500', ring: 'ring-violet-500/25', halo: 'bg-violet-500/35' },
      spotlight: { ring: 'rgba(134, 82, 251, 0.50)', glow: 'rgba(134, 82, 251, 0.55)' },
    },
    {
      labelKey: 'home.platformStats.kpi.verifications',
      value: `+${fmtCount(data.global.verifications)}`,
      Icon: ShieldCheck,
      chip: { bg: 'bg-sky-500/10', text: 'text-sky-500', ring: 'ring-sky-500/25', halo: 'bg-sky-500/35' },
      spotlight: { ring: 'rgba(0, 191, 238, 0.50)', glow: 'rgba(0, 191, 238, 0.60)' },
    },
    {
      labelKey: 'home.platformStats.kpi.amountReported',
      value: formatCurrency(data.global.montant),
      Icon: Wallet,
      chip: { bg: 'bg-green-500/10', text: 'text-green-500', ring: 'ring-green-500/25', halo: 'bg-green-500/35' },
      spotlight: { ring: 'rgba(34, 196, 94, 0.50)', glow: 'rgba(34, 196, 94, 0.55)' },
    },
    {
      labelKey: 'home.platformStats.kpi.lastReport',
      value: data.global.dernier,
      Icon: Clock,
      chip: { bg: 'bg-orange-500/10', text: 'text-orange-500', ring: 'ring-orange-500/25', halo: 'bg-orange-500/35' },
      spotlight: { ring: 'rgba(242, 155, 17, 0.50)', glow: 'rgba(242, 155, 17, 0.60)' },
    },
  ];

  return (
    <PageLayout>
      <div className="mb-6">
        <BackButton />
      </div>

      <PageHeading
        titleKey="statsPage.title"
        subtitleKey="statsPage.subtitle"
        accent="gradient"
      />

      <StatsPeriodTabs value={period} onChange={setPeriod} />

      <ul
        aria-label={t('statsPage.aria.global')}
        className="grid grid-cols-2 gap-4 lg:grid-cols-3"
      >
        {globalCards.map((s, i) => (
          <li
            key={s.labelKey}
            // Stagger the entrance card-by-card (same recipe as the
            // homepage PlatformStats so the two surfaces feel like
            // one product).
            className="relative animate-fade-in-down"
            style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
          >
            {/* Spotlight overlay — sibling of the article so its outer
                box-shadow halo is NOT clipped by overflow-hidden. The
                halo colour is the card's accent (navy / red / violet
                / sky / green / orange) so each spotlight matches its
                icon chip. animate-card-spotlight stagger via
                `i * 1500ms` makes the highlight ripple through the
                six cards in a 9 s loop. */}
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
              {/* Diagonal shimmer light — fires on hover for a subtle
                  "wipe" of light across the card surface. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"
              />

              {/* Accent chip — small coloured square with a pulsing
                  halo behind it. Scales + rotates on card hover. */}
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
                <p className="mt-1.5 text-xs md:text-sm text-gray-500 truncate">
                  {t(s.labelKey)}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className={CHART_CARD}>
          <ChartHeader title={t('statsPage.chart.problems')} mode={problemsMode} setMode={setProblemsMode} />
          <ul className="space-y-4">
            {PROBLEM_LABELS.map((p, i) => {
              const d = data.problems[i]!;
              return (
                <li key={p.labelKey} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy">
                      <p.Icon className="h-4 w-4 text-brand-navy group-hover:scale-110 group-hover:animate-sparkle-pop transition-transform" aria-hidden />
                      {t(p.labelKey)}
                    </span>
                    <span className="text-sm font-bold text-brand-navy tabular-nums">
                      <AnimatedCounter value={fmtBar(d.count, d.pct, problemsMode)} duration={900} />
                    </span>
                  </div>
                  <AnimatedBar pct={d.pct} gradient={p.gradient} trigger={problemsTrigger} />
                </li>
              );
            })}
          </ul>
        </div>

        <div className={CHART_CARD}>
          <ChartHeader title={t('statsPage.chart.channels')} mode={channelsMode} setMode={setChannelsMode} />
          <div className="grid grid-cols-2 gap-3">
            {CHANNEL_LABELS.map((c, i) => {
              const d = data.channels[i]!;
              return (
                <div
                  key={`${channelsTrigger}-${c.labelKey}`}
                  className={`group rounded-2xl bg-white/80 border-2 ${c.accent} ${c.cardGlow} p-4 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] cursor-default animate-card-flash`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                    <c.Icon className="h-4 w-4 group-hover:scale-110 group-hover:animate-sparkle-pop transition-transform" aria-hidden />
                    {t(c.labelKey)}
                  </div>
                  <div
                    className={`mt-3 inline-flex items-center justify-center rounded-pill ${c.badgeBg} text-white text-sm font-bold px-3 py-1 tabular-nums`}
                  >
                    <AnimatedCounter value={fmtBar(d.count, d.pct, channelsMode)} duration={900} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={CHART_CARD}>
          <ChartHeader title={t('statsPage.chart.activity')} mode={activityMode} setMode={setActivityMode} />
          <div className="flex items-end gap-4 h-56 px-2">
            <div className="flex flex-col justify-between h-full text-[10px] text-gray-400 pr-2">
              {[80, 70, 60, 50, 40, 30, 20, 10, 0].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-4 items-end gap-4 h-full">
              {ACTIVITY_LABELS.map((a, i) => {
                const d = data.activity[i]!;
                return (
                  <div key={a.labelKey} className="group flex flex-col items-center h-full justify-end cursor-default">
                    <span className="text-xs font-bold text-brand-navy mb-1 tabular-nums group-hover:scale-110 transition-transform">
                      <AnimatedCounter value={fmtBar(d.count, d.pct, activityMode)} duration={900} />
                    </span>
                    <AnimatedColumn pct={d.pct} gradient={a.gradient} trigger={activityTrigger} />
                    <span className="mt-2 text-xs font-medium text-gray-500 group-hover:text-brand-navy transition-colors">
                      {t(a.labelKey)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={CHART_CARD}>
          <h2 className="text-lg font-bold text-brand-navy mb-5">{t('statsPage.chart.evolution')}</h2>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">{t('statsPage.evolution.vsPrevious', { pct: data.evolutionPct })}</p>
                <span className="mt-1 inline-flex items-center rounded-pill bg-grad-stat-red text-white font-bold px-4 py-1.5 text-sm shadow-glow-red transition-transform hover:scale-105 cursor-default">
                  <AnimatedCounter value={fmtCount(data.evolutionThisCount)} />
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('statsPage.evolution.today')}</p>
                <span className="mt-1 inline-flex items-center rounded-pill bg-grad-stat-red text-white font-bold px-4 py-1.5 text-sm shadow-glow-red transition-transform hover:scale-105 cursor-default">
                  <AnimatedCounter value={fmtCount(data.evolutionTodayCount)} />
                </span>
              </div>
            </div>
            <div className="flex justify-center group">
              <div className="transition-transform group-hover:scale-110 duration-300">
                <AnimatedDonut value={data.evolutionPct} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`mt-4 ${CHART_CARD}`}>
        <h2 className="text-lg font-bold text-brand-navy text-center mb-5">
          {t('statsPage.chart.status')}
        </h2>

        <div className="flex flex-wrap justify-center gap-3 mb-5">
          {STATUS_LABELS.map((s, i) => {
            const d = data.status[i]!;
            return (
              <div
                key={s.labelKey}
                className={`group inline-flex items-center gap-2 rounded-pill ${s.color} text-white ${s.glow} px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-1 hover:scale-105 cursor-default`}
              >
                <Siren className="h-4 w-4 group-hover:animate-sparkle-pop" aria-hidden />
                <span className="text-base font-bold tabular-nums">
                  <AnimatedCounter value={fmtCount(d.count)} />
                </span>
                <span className="text-xs opacity-90">{t(s.labelKey)}</span>
              </div>
            );
          })}
        </div>
        <div className="relative h-2 rounded-pill bg-white/60 overflow-hidden border border-white/50">
          <div
            className="absolute inset-y-0 left-0 rounded-pill bg-grad-stat-navy transition-[width] duration-700 ease-out"
            style={{ width: `${data.processingPct}%` }}
          />
        </div>
        <p className="mt-2 text-right text-sm font-bold text-brand-navy tabular-nums">
          {data.processingPct}%
        </p>
      </section>

      <section className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/#recherche"
          className="inline-flex items-center gap-2 rounded-pill bg-green-500 hover:bg-green-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-green animate-verify-pulse hover:scale-[1.03] hover:[animation-play-state:paused] transition-all"
        >
          <ShieldCheck className="h-5 w-5 animate-siren-wiggle" aria-hidden />
          {t('statsPage.cta.verify')}
        </Link>
        <Link
          href="/signaler"
          className="inline-flex items-center gap-2 rounded-pill bg-red-500 hover:bg-red-700 text-white px-6 py-3 text-sm font-semibold shadow-glow-red animate-alert-pulse hover:scale-[1.03] hover:[animation-play-state:paused] transition-all"
        >
          <Siren className="h-5 w-5 animate-siren-wiggle" aria-hidden />
          {t('statsPage.cta.share')}
        </Link>
      </section>

      <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
        {t('statsPage.disclaimer')}
      </p>
    </PageLayout>
  );
}
