'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Siren,
  Clock,
  Copy,
  XCircle,
  FileX2,
  CreditCard,
  FileWarning,
  VenetianMask,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { PeriodTabs } from '@/components/admin/PeriodTabs';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import {
  daysBetween,
  frNumber,
  periodMultiplier,
  scale,
} from '@/lib/period';

type KpiBase = {
  baseValue: number;
  label: string;
  gradient: string;
  glow: string;
  Icon: LucideIcon;
  href: string;
};

const KPIS: KpiBase[] = [
  { baseValue: 25, label: 'Total Signalements', gradient: 'bg-grad-stat-violet', glow: 'shadow-glow-violet', Icon: Siren, href: '/admin/signalements' },
  { baseValue: 8, label: 'En attente', gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange', Icon: Clock, href: '/admin/signalements' },
  { baseValue: 13, label: 'Publiés', gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green', Icon: Copy, href: '/admin/signalements' },
  { baseValue: 4, label: 'Refusés', gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red', Icon: XCircle, href: '/admin/signalements' },
];

const PROBLEM_KPIS: { baseValue: number; label: string; Icon: LucideIcon }[] = [
  { baseValue: 5, label: 'Non livraison', Icon: FileX2 },
  { baseValue: 13, label: 'Bloqué après paiement', Icon: CreditCard },
  { baseValue: 3, label: 'Produit non conforme', Icon: FileWarning },
  { baseValue: 4, label: "Usurpation d'identité", Icon: VenetianMask },
];

const CHANNELS_BASE = [
  { label: 'Téléphone', base: 1, pct: 4 },
  { label: 'Réseaux sociaux', base: 8, pct: 32 },
  { label: 'WhatsApp', base: 8, pct: 32 },
  { label: 'Binance', base: 1, pct: 4 },
  { label: 'Email', base: 1, pct: 4 },
  { label: 'PayPal', base: 0, pct: 0 },
  { label: 'Site web', base: 2, pct: 8 },
  { label: 'RIB', base: 3, pct: 12 },
];

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeChannel, setActiveChannel] = useState(2);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [periodLabel, setPeriodLabel] = useState('Aujourd’hui');
  const [rangeDays, setRangeDays] = useState<number | undefined>(undefined);

  const mult = periodMultiplier(periodIndex, rangeDays);
  const processingRate = Math.min(98, Math.max(52, 68 + (periodIndex - 2) * 3));

  const kpis = useMemo(
    () => KPIS.map((k) => ({ ...k, value: scale(k.baseValue, mult) })),
    [mult],
  );
  const problems = useMemo(
    () => PROBLEM_KPIS.map((p) => ({ ...p, value: scale(p.baseValue, mult) })),
    [mult],
  );
  const channels = useMemo(
    () => CHANNELS_BASE.map((c) => ({ ...c, count: scale(c.base, mult) })),
    [mult],
  );

  const channel = channels[activeChannel] ?? channels[0]!;

  const exportRows = (): (string | number)[][] => [
    ['Section', 'Indicateur', 'Valeur', 'Période'],
    ...kpis.map((k) => ['KPI', k.label, k.value, periodLabel]),
    ['KPI', 'Taux de traitement', `${processingRate}%`, periodLabel],
    ...problems.map((p) => ['Problème', p.label, p.value, periodLabel]),
    ...channels.map((c) => ['Canal', c.label, `${c.count} (${c.pct}%)`, periodLabel]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Période : <span className="font-semibold text-brand-navy">{periodLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-dashboard" getRows={exportRows} />
        </div>
      </div>

      <div className="mb-8">
        <PeriodTabs
          defaultActive={0}
          onChange={(label, index, range) => {
            setPeriodLabel(label);
            setPeriodIndex(index);
            setRangeDays(range ? daysBetween(range.from, range.to) : undefined);
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className={`${k.gradient} ${k.glow} text-white rounded-2xl p-5 flex items-center justify-between hover:scale-[1.02] transition-transform`}
          >
            <div>
              <p className="text-4xl font-bold">
                <AnimatedCounter
                  key={`${refreshKey}-${k.label}-${mult}`}
                  value={frNumber(k.value)}
                />
              </p>
              <p className="mt-1 text-sm font-medium opacity-90">{k.label}</p>
            </div>
            <k.Icon className="h-9 w-9 opacity-70" aria-hidden />
          </Link>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-brand-navy">Taux de traitement</p>
          <p className="text-sm font-bold text-brand-navy">
            <AnimatedCounter
              key={`${refreshKey}-rate-${mult}`}
              value={`${processingRate}%`}
            />
          </p>
        </div>
        <div className="h-2 rounded-pill bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-brand-navy rounded-pill transition-all duration-500"
            style={{ width: `${processingRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          (Publiés + Refusés) / Total — indique la réactivité de l’équipe de modération.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {problems.map((p) => (
          <Link
            key={p.label}
            href="/admin/signalements"
            className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 flex items-center justify-between hover:border-brand-blue transition-colors"
          >
            <div>
              <p className="text-4xl font-bold text-brand-blue">
                <AnimatedCounter
                  key={`${refreshKey}-${p.label}-${mult}`}
                  value={frNumber(p.value)}
                />
              </p>
              <p className="mt-1 text-sm text-gray-500">{p.label}</p>
            </div>
            <p.Icon className="h-7 w-7 text-gray-400" aria-hidden />
          </Link>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5">
        <p className="text-sm font-semibold text-brand-navy mb-3">Taux de problème par canal</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {channels.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setActiveChannel(i)}
              className={
                i === activeChannel
                  ? 'flex items-center justify-between gap-2 rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium shadow-glow-navy'
                  : 'flex items-center justify-between gap-2 rounded-pill bg-white border border-sky-500 text-brand-navy px-4 py-1.5 text-sm font-medium hover:bg-brand-sky/30 transition-colors'
              }
            >
              <span>{c.label}</span>
              <span
                className={
                  i === activeChannel
                    ? 'text-xs bg-white/20 rounded-full px-1.5'
                    : 'text-xs bg-sky-100 text-sky-700 rounded-full px-1.5'
                }
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>
        <div className="h-2 rounded-pill bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-brand-blue rounded-pill transition-all duration-500"
            style={{ width: `${channel.pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Canal actif : <span className="font-semibold text-brand-navy">{channel.label}</span> —{' '}
          <AnimatedCounter
            key={`${refreshKey}-channel-${activeChannel}`}
            value={`${channel.pct}%`}
          />{' '}
          des signalements sur la période sélectionnée.
        </p>
      </section>
    </div>
  );
}
