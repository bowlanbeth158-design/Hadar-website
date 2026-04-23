'use client';

import { useState } from 'react';
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

const KPIS: { value: string; label: string; gradient: string; glow: string; Icon: LucideIcon }[] = [
  { value: '25', label: 'Total Signalements', gradient: 'bg-grad-stat-violet', glow: 'shadow-glow-violet', Icon: Siren },
  { value: '8', label: 'En attente', gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange', Icon: Clock },
  { value: '13', label: 'Publiés', gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green', Icon: Copy },
  { value: '4', label: 'Refusés', gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red', Icon: XCircle },
];

const PROBLEM_KPIS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: '5', label: 'Non livraison', Icon: FileX2 },
  { value: '13', label: 'Bloqué après paiement', Icon: CreditCard },
  { value: '3', label: 'Produit non conforme', Icon: FileWarning },
  { value: '4', label: "Usurpation d'identité", Icon: VenetianMask },
];

const CHANNELS = [
  { label: 'Téléphone', count: 1, pct: 4 },
  { label: 'Réseaux sociaux', count: 8, pct: 32 },
  { label: 'WhatsApp', count: 8, pct: 32 },
  { label: 'Binance', count: 1, pct: 4 },
  { label: 'Email', count: 1, pct: 4 },
  { label: 'PayPal', count: 0, pct: 0 },
  { label: 'Site web', count: 2, pct: 8 },
  { label: 'RIB', count: 3, pct: 12 },
];

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeChannel, setActiveChannel] = useState(2);
  const processingRate = 68;
  const channel = CHANNELS[activeChannel] ?? CHANNELS[0]!;

  const exportRows = (): (string | number)[][] => [
    ['Section', 'Indicateur', 'Valeur'],
    ...KPIS.map((k) => ['KPI', k.label, k.value]),
    ['KPI', 'Taux de traitement', `${processingRate}%`],
    ...PROBLEM_KPIS.map((p) => ['Problème', p.label, p.value]),
    ...CHANNELS.map((c) => ['Canal', c.label, `${c.count} (${c.pct}%)`]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Dashboard</h1>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-dashboard" getRows={exportRows} />
        </div>
      </div>

      <div className="mb-8">
        <PeriodTabs defaultActive={0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className={`${k.gradient} ${k.glow} text-white rounded-2xl p-5 flex items-center justify-between`}
          >
            <div>
              <p className="text-4xl font-bold">
                <AnimatedCounter key={`${refreshKey}-${k.label}`} value={k.value} />
              </p>
              <p className="mt-1 text-sm font-medium opacity-90">{k.label}</p>
            </div>
            <k.Icon className="h-9 w-9 opacity-70" aria-hidden />
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-brand-navy">Taux de traitement</p>
          <p className="text-sm font-bold text-brand-navy">
            <AnimatedCounter key={`${refreshKey}-rate`} value={`${processingRate}%`} />
          </p>
        </div>
        <div className="h-2 rounded-pill bg-gray-200 overflow-hidden">
          <div className="h-full bg-brand-navy rounded-pill" style={{ width: `${processingRate}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          (Publiés + Refusés) / Total — indique la réactivité de l’équipe de modération.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {PROBLEM_KPIS.map((p) => (
          <div
            key={p.label}
            className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-4xl font-bold text-brand-blue">
                <AnimatedCounter key={`${refreshKey}-${p.label}`} value={p.value} />
              </p>
              <p className="mt-1 text-sm text-gray-500">{p.label}</p>
            </div>
            <p.Icon className="h-7 w-7 text-gray-400" aria-hidden />
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5">
        <p className="text-sm font-semibold text-brand-navy mb-3">Taux de problème par canal</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {CHANNELS.map((c, i) => (
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
          <AnimatedCounter key={`${refreshKey}-channel-${activeChannel}`} value={`${channel.pct}%`} /> des
          signalements sur la période sélectionnée.
        </p>
      </section>
    </div>
  );
}
