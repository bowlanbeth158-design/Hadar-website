'use client';

import { useState } from 'react';
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

type DisplayMode = 'count' | 'percent';

// French number formatter — 1245 → "1 245"
function fmtCount(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ').replace(/ /g, ' ');
}

function fmtMAD(n: number): string {
  return `${fmtCount(n)} MAD`;
}

// Format a (count, pct) pair according to the chart's display mode.
// - 'count'   → "1 245"
// - 'percent' → "50%"   (single % suffix; never double)
function fmtBar(count: number, pct: number, mode: DisplayMode): string {
  return mode === 'count' ? fmtCount(count) : `${pct}%`;
}

// One snapshot of the page numbers per analysis period. Real values will
// come from the /api/stats endpoint when the backend lands; for now these
// are owner-validated mock numbers chosen so the period tabs visibly
// change every chart on the page.
type Snapshot = {
  global: {
    utilisateurs: number;
    signalements: number;
    contacts: number;
    verifications: number;
    montant: number; // MAD
    dernier: string; // e.g. "il y a 12 min"
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

const DATA: Record<Period, Snapshot> = {
  today: {
    global: {
      utilisateurs: 143,
      signalements: 37,
      contacts: 12,
      verifications: 512,
      montant: 14_200,
      dernier: 'il y a 12 min',
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
      dernier: 'hier, 19:42',
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
      dernier: 'il y a 2 h',
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
      dernier: 'il y a 2 h',
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

const PROBLEM_LABELS: { label: string; Icon: LucideIcon; gradient: string }[] = [
  { label: 'Non livraison',         Icon: PackageX,       gradient: 'bg-grad-stat-red'    },
  { label: 'Blocage après paiement',Icon: Ban,            gradient: 'bg-grad-stat-orange' },
  { label: 'Produit non conforme',  Icon: AlertTriangle,  gradient: 'bg-grad-alert-yellow'},
  { label: "Usurpation d'identité", Icon: VenetianMask,   gradient: 'bg-grad-stat-violet' },
];

const CHANNEL_LABELS: {
  label: string; Icon: LucideIcon; accent: string; badgeBg: string; cardGlow: string;
}[] = [
  { label: 'RIB',             Icon: CreditCard,    accent: 'border-orange-500', badgeBg: 'bg-grad-stat-orange', cardGlow: 'shadow-glow-orange' },
  { label: 'WhatsApp',        Icon: MessageCircle, accent: 'border-green-500',  badgeBg: 'bg-grad-stat-green',  cardGlow: 'shadow-glow-green'  },
  { label: 'Réseaux sociaux', Icon: AtSign,        accent: 'border-violet-500', badgeBg: 'bg-grad-stat-violet', cardGlow: 'shadow-glow-violet' },
  { label: 'Site web',        Icon: Globe,         accent: 'border-brand-blue', badgeBg: 'bg-grad-stat-navy',   cardGlow: 'shadow-glow-blue'   },
];

const ACTIVITY_LABELS: { label: string; gradient: string }[] = [
  { label: 'Faible',    gradient: 'bg-grad-stat-navy'    },
  { label: 'Vigilance', gradient: 'bg-grad-alert-yellow' },
  { label: 'Modéré',    gradient: 'bg-grad-stat-orange'  },
  { label: 'Élevé',     gradient: 'bg-grad-stat-red'     },
];

const STATUS_LABELS: { label: string; color: string; glow: string }[] = [
  { label: 'Signalements soumis',  color: 'bg-grad-stat-orange', glow: 'shadow-glow-orange' },
  { label: 'Signalements refusés', color: 'bg-grad-stat-navy',   glow: 'shadow-glow-soft'   },
  { label: 'Signalements publiés', color: 'bg-grad-stat-green',  glow: 'shadow-glow-green'  },
];

const CHART_CARD =
  'rounded-2xl bg-gradient-to-br from-brand-sky/30 via-white to-brand-sky/35 backdrop-blur-sm border border-white/70 p-6 shadow-glow-soft hover:shadow-glow-blue hover:-translate-y-0.5 transition-all duration-300 ease-out';

// Compact Nombre / % toggle — small enough to dock next to a chart's
// title. Each chart owns its own DisplayMode state, so toggling one
// chart never silently re-formats the others.
function DisplayModeToggle({
  value,
  onChange,
}: {
  value: DisplayMode;
  onChange: (m: DisplayMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Format des chiffres"
      className="inline-flex items-center rounded-pill bg-white/70 backdrop-blur-sm border border-white/80 p-0.5 shadow-sm"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'count'}
        onClick={() => onChange('count')}
        title="Afficher en nombre"
        className={
          value === 'count'
            ? 'inline-flex items-center gap-1 rounded-pill bg-grad-stat-navy text-white px-2.5 py-1 text-[11px] font-semibold shadow-glow-navy'
            : 'inline-flex items-center gap-1 rounded-pill text-brand-navy/70 hover:text-brand-navy px-2.5 py-1 text-[11px] font-medium transition-colors'
        }
      >
        <Hash className="h-3 w-3" aria-hidden />
        Nombre
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'percent'}
        onClick={() => onChange('percent')}
        title="Afficher en pourcentage"
        className={
          value === 'percent'
            ? 'inline-flex items-center gap-1 rounded-pill bg-grad-stat-navy text-white px-2.5 py-1 text-[11px] font-semibold shadow-glow-navy'
            : 'inline-flex items-center gap-1 rounded-pill text-brand-navy/70 hover:text-brand-navy px-2.5 py-1 text-[11px] font-medium transition-colors'
        }
      >
        <Percent className="h-3 w-3" aria-hidden />
        %
      </button>
    </div>
  );
}

// Reusable chart-card title row with an optional docked DisplayModeToggle.
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

  // One DisplayMode per chart that supports it. Status no longer has a
  // toggle (per owner request), so it always shows raw counts.
  const [problemsMode, setProblemsMode] = useState<DisplayMode>('count');
  const [channelsMode, setChannelsMode] = useState<DisplayMode>('count');
  const [activityMode, setActivityMode] = useState<DisplayMode>('count');

  const data = DATA[period];

  // Build the 6 KPI cards from the period snapshot.
  const globalCards: {
    label: string;
    value: string;
    gradient: string;
    glow: string;
    Icon: LucideIcon;
  }[] = [
    { label: 'Utilisateurs actifs',       value: fmtCount(data.global.utilisateurs),  gradient: 'bg-grad-stat-navy',   glow: 'shadow-glow-navy',   Icon: Users      },
    { label: 'Signalements enregistrés',  value: fmtCount(data.global.signalements),  gradient: 'bg-grad-stat-red',    glow: 'shadow-glow-red',    Icon: Siren      },
    { label: 'Contacts signalés',         value: fmtCount(data.global.contacts),      gradient: 'bg-grad-stat-violet', glow: 'shadow-glow-violet', Icon: Smartphone },
    { label: 'Vérifications réalisées',   value: `+${fmtCount(data.global.verifications)}`, gradient: 'bg-grad-stat-sky', glow: 'shadow-glow-sky', Icon: ShieldCheck },
    { label: 'Montant signalé',           value: fmtMAD(data.global.montant),         gradient: 'bg-grad-stat-green',  glow: 'shadow-glow-green',  Icon: Wallet     },
    { label: 'Dernier signalement',       value: data.global.dernier,                 gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange', Icon: Clock      },
  ];

  return (
    <PageLayout>
      <div className="mb-6">
        <BackButton />
      </div>

      <PageHeading
        title="Statistiques de la plateforme"
        subtitle="Analysez l’évolution et les tendances des signalements sur la plateforme."
        accent="gradient"
      />

      <StatsPeriodTabs value={period} onChange={setPeriod} />

      <section
        aria-label="Indicateurs globaux"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {globalCards.map((s) => (
          <div
            key={s.label}
            className={`group ${s.gradient} ${s.glow} text-white rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] cursor-default`}
          >
            <div>
              <p className="text-3xl font-bold">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-sm font-medium opacity-90 mt-1">{s.label}</p>
            </div>
            <s.Icon className="h-9 w-9 opacity-70 group-hover:scale-110 group-hover:opacity-100 group-hover:animate-sparkle-pop transition-all" aria-hidden />
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className={CHART_CARD}>
          <ChartHeader title="Types de problèmes signalés" mode={problemsMode} setMode={setProblemsMode} />
          <ul className="space-y-4">
            {PROBLEM_LABELS.map((p, i) => {
              const d = data.problems[i]!;
              return (
                <li key={p.label} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy">
                      <p.Icon className="h-4 w-4 text-brand-navy group-hover:scale-110 group-hover:animate-sparkle-pop transition-transform" aria-hidden />
                      {p.label}
                    </span>
                    <span className="text-sm font-bold text-brand-navy tabular-nums">
                      <AnimatedCounter value={fmtBar(d.count, d.pct, problemsMode)} duration={900} />
                    </span>
                  </div>
                  <div className="h-2 rounded-pill bg-white/60 overflow-hidden border border-white/50">
                    <div
                      className={`h-full rounded-pill ${p.gradient} transition-[width] duration-700 ease-out group-hover:brightness-110`}
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={CHART_CARD}>
          <ChartHeader title="Canaux plus signalés" mode={channelsMode} setMode={setChannelsMode} />
          <div className="grid grid-cols-2 gap-3">
            {CHANNEL_LABELS.map((c, i) => {
              const d = data.channels[i]!;
              return (
                <div
                  key={c.label}
                  className={`group rounded-2xl bg-white/80 border-2 ${c.accent} ${c.cardGlow} p-4 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] cursor-default`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                    <c.Icon className="h-4 w-4 group-hover:scale-110 group-hover:animate-sparkle-pop transition-transform" aria-hidden />
                    {c.label}
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
          <ChartHeader title="Niveau d'activité des signalements" mode={activityMode} setMode={setActivityMode} />
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
                  <div key={a.label} className="group flex flex-col items-center h-full justify-end cursor-default">
                    <span className="text-xs font-bold text-brand-navy mb-1 tabular-nums group-hover:scale-110 transition-transform">
                      <AnimatedCounter value={fmtBar(d.count, d.pct, activityMode)} duration={900} />
                    </span>
                    <div
                      className={`w-full ${a.gradient} rounded-t-xl shadow-md transition-[height,filter] duration-700 ease-out group-hover:brightness-110 group-hover:shadow-lg`}
                      style={{ height: `${d.pct}%` }}
                    />
                    <span className="mt-2 text-xs font-medium text-gray-500 group-hover:text-brand-navy transition-colors">
                      {a.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={CHART_CARD}>
          <h2 className="text-lg font-bold text-brand-navy mb-5">Evolution des signalements</h2>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">+{data.evolutionPct}% vs période précédente</p>
                <span className="mt-1 inline-flex items-center rounded-pill bg-grad-stat-red text-white font-bold px-4 py-1.5 text-sm shadow-glow-red transition-transform hover:scale-105 cursor-default">
                  <AnimatedCounter value={fmtCount(data.evolutionThisCount)} />
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">+45% aujourd&apos;hui</p>
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
        {/* Status section — owner asked to drop the Nombre/% toggle here.
            Pills now always show raw counts (the most natural read for a
            status breakdown). Title stays centred. */}
        <h2 className="text-lg font-bold text-brand-navy text-center mb-5">
          Statut des signalements
        </h2>

        <div className="flex flex-wrap justify-center gap-3 mb-5">
          {STATUS_LABELS.map((s, i) => {
            const d = data.status[i]!;
            return (
              <div
                key={s.label}
                className={`group inline-flex items-center gap-2 rounded-pill ${s.color} text-white ${s.glow} px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-1 hover:scale-105 cursor-default`}
              >
                <Siren className="h-4 w-4 group-hover:animate-sparkle-pop" aria-hidden />
                <span className="text-base font-bold tabular-nums">
                  <AnimatedCounter value={fmtCount(d.count)} />
                </span>
                <span className="text-xs opacity-90">{s.label}</span>
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

      {/* Bottom CTAs — same recipe as the home banner CTAs so the page
          ends on the exact action surface the banner introduced. */}
      <section className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/#recherche"
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
      </section>

      <p className="mt-8 text-xs text-gray-400 text-center max-w-2xl mx-auto">
        Les données présentées sont issues de signalements publiés et sont fournies à titre
        indicatif. Aucune donnée personnelle n&apos;est affichée.
      </p>
    </PageLayout>
  );
}
