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
import { useI18n } from '@/lib/i18n/provider';

type KpiBase = {
  baseValue: number;
  labelKey: string;
  gradient: string;
  glow: string;
  Icon: LucideIcon;
  href: string;
};

const KPIS: KpiBase[] = [
  { baseValue: 25, labelKey: 'dashboard.kpi.totalReports', gradient: 'bg-grad-stat-violet', glow: 'shadow-glow-violet', Icon: Siren, href: '/admin/signalements' },
  { baseValue: 8, labelKey: 'dashboard.kpi.pending', gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange', Icon: Clock, href: '/admin/signalements' },
  { baseValue: 13, labelKey: 'dashboard.kpi.published', gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green', Icon: Copy, href: '/admin/signalements' },
  { baseValue: 4, labelKey: 'dashboard.kpi.rejected', gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red', Icon: XCircle, href: '/admin/signalements' },
];

const PROBLEM_KPIS: { baseValue: number; labelKey: string; Icon: LucideIcon }[] = [
  { baseValue: 5, labelKey: 'dashboard.problem.nonDelivery', Icon: FileX2 },
  { baseValue: 13, labelKey: 'dashboard.problem.blockedAfterPayment', Icon: CreditCard },
  { baseValue: 3, labelKey: 'dashboard.problem.nonCompliant', Icon: FileWarning },
  { baseValue: 4, labelKey: 'dashboard.problem.identityTheft', Icon: VenetianMask },
];

const CHANNELS_BASE = [
  { labelKey: 'channel.phone', base: 1, pct: 4 },
  { labelKey: 'channel.socialMedia', base: 8, pct: 32 },
  { labelKey: 'channel.whatsapp', base: 8, pct: 32 },
  { labelKey: 'channel.binance', base: 1, pct: 4 },
  { labelKey: 'channel.email', base: 1, pct: 4 },
  { labelKey: 'channel.paypal', base: 0, pct: 0 },
  { labelKey: 'channel.website', base: 2, pct: 8 },
  { labelKey: 'channel.rib', base: 3, pct: 12 },
];

export default function Page() {
  const { t } = useI18n();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeChannel, setActiveChannel] = useState(2);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [periodLabel, setPeriodLabel] = useState(t('period.today'));
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
    [t('export.section'), t('export.indicator'), t('export.value'), t('export.period')],
    ...kpis.map((k) => [t('export.kpi'), t(k.labelKey), k.value, periodLabel]),
    [t('export.kpi'), t('dashboard.processingRate'), `${processingRate}%`, periodLabel],
    ...problems.map((p) => [t('export.problem'), t(p.labelKey), p.value, periodLabel]),
    ...channels.map((c) => [t('export.channel'), t(c.labelKey), `${c.count} (${c.pct}%)`, periodLabel]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
            {t('page.dashboard.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('period.label')} :{' '}
            <span className="font-semibold text-brand-navy">{periodLabel}</span>
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
            key={k.labelKey}
            href={k.href}
            className={`${k.gradient} ${k.glow} text-white rounded-2xl p-5 flex items-center justify-between hover:scale-[1.02] transition-transform`}
          >
            <div>
              <p className="text-4xl font-bold">
                <AnimatedCounter
                  key={`${refreshKey}-${k.labelKey}-${mult}`}
                  value={frNumber(k.value)}
                />
              </p>
              <p className="mt-1 text-sm font-medium opacity-90">{t(k.labelKey)}</p>
            </div>
            <k.Icon className="h-9 w-9 opacity-70" aria-hidden />
          </Link>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-brand-navy">{t('dashboard.processingRate')}</p>
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
        <p className="mt-2 text-xs text-gray-400">{t('dashboard.processingRateNote')}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {problems.map((p) => (
          <Link
            key={p.labelKey}
            href="/admin/signalements"
            className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 flex items-center justify-between hover:border-brand-blue transition-colors"
          >
            <div>
              <p className="text-4xl font-bold text-brand-blue">
                <AnimatedCounter
                  key={`${refreshKey}-${p.labelKey}-${mult}`}
                  value={frNumber(p.value)}
                />
              </p>
              <p className="mt-1 text-sm text-gray-500">{t(p.labelKey)}</p>
            </div>
            <p.Icon className="h-7 w-7 text-gray-400" aria-hidden />
          </Link>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5">
        <p className="text-sm font-semibold text-brand-navy mb-3">
          {t('dashboard.channels.title')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {channels.map((c, i) => (
            <button
              key={c.labelKey}
              type="button"
              onClick={() => setActiveChannel(i)}
              className={
                i === activeChannel
                  ? 'flex items-center justify-between gap-2 rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium shadow-glow-navy'
                  : 'flex items-center justify-between gap-2 rounded-pill bg-white border border-sky-500 text-brand-navy px-4 py-1.5 text-sm font-medium hover:bg-brand-sky/30 transition-colors'
              }
            >
              <span>{t(c.labelKey)}</span>
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
          {t('dashboard.channels.activeNote', {
            label: t(channel.labelKey),
            pct: `${channel.pct}%`,
          })}
        </p>
      </section>
    </div>
  );
}
