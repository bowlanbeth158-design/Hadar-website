'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Clock,
  Copy,
  XCircle,
  PencilLine,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { PeriodTabs } from '@/components/admin/PeriodTabs';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';

type Status = 'en_cours' | 'publie' | 'non_retenu' | 'a_corriger';

const STATUS_CONFIG: Record<
  Status,
  { label: string; pill: string; text: string; Icon: LucideIcon; gradient: string; glow: string }
> = {
  en_cours: { label: 'En cours', pill: 'bg-orange-100', text: 'text-orange-700', Icon: Clock, gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange' },
  publie: { label: 'Publié', pill: 'bg-green-100', text: 'text-green-700', Icon: Copy, gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green' },
  non_retenu: { label: 'Non retenu', pill: 'bg-red-100', text: 'text-red-700', Icon: XCircle, gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red' },
  a_corriger: { label: 'À corriger', pill: 'bg-brand-sky', text: 'text-brand-navy', Icon: PencilLine, gradient: 'bg-grad-stat-navy', glow: 'shadow-glow-navy' },
};

const KPIS: { status: Status; count: string; pct: number }[] = [
  { status: 'en_cours', count: '2', pct: 40 },
  { status: 'publie', count: '1', pct: 20 },
  { status: 'non_retenu', count: '1', pct: 20 },
  { status: 'a_corriger', count: '1', pct: 20 },
];

const REPORTS: {
  id: string;
  contact: string;
  problem: string;
  amount: string;
  date: string;
  status: Status;
}[] = [
  { id: '2454', contact: 'WhatsApp', problem: 'Non livraison', amount: '500 MAD', date: '13/04/26  23:12:05', status: 'en_cours' },
  { id: '2453', contact: 'RIB', problem: 'Bloqué après paiement', amount: '1 200 MAD', date: '13/04/26  22:48:17', status: 'en_cours' },
  { id: '2452', contact: 'Email', problem: 'Produit non conforme', amount: '340 MAD', date: '13/04/26  19:05:44', status: 'publie' },
  { id: '2451', contact: 'Téléphone', problem: "Usurpation d'identité", amount: '—', date: '13/04/26  15:33:09', status: 'non_retenu' },
  { id: '2450', contact: 'Site web', problem: 'Non livraison', amount: '850 MAD', date: '13/04/26  12:21:55', status: 'a_corriger' },
];

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Contact', 'Type problème', 'Montant', 'Date & heure', 'Statut'],
    ...REPORTS.map((r) => [
      `#${r.id}`,
      r.contact,
      r.problem,
      r.amount,
      r.date,
      STATUS_CONFIG[r.status].label,
    ]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Signalements</h1>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-signalements" getRows={exportRows} />
        </div>
      </div>

      <div className="mb-8">
        <PeriodTabs defaultActive={0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {KPIS.map((k) => {
          const c = STATUS_CONFIG[k.status];
          return (
            <div
              key={k.status}
              className={`${c.gradient} ${c.glow} text-white rounded-2xl overflow-hidden`}
            >
              <div className="h-1 bg-white/30">
                <div className="h-full bg-white" style={{ width: `${k.pct}%` }} />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">
                    <AnimatedCounter key={`${refreshKey}-${k.status}`} value={k.count} />
                  </p>
                  <p className="mt-1 text-sm font-medium opacity-90">{c.label}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <c.Icon className="h-7 w-7 opacity-80" aria-hidden />
                  <span className="text-xs font-semibold opacity-90">
                    <AnimatedCounter key={`${refreshKey}-pct-${k.status}`} value={`${k.pct}%`} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th scope="col" className="text-left px-5 py-3 font-semibold">ID</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Contact</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Type problème</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Montant</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Date & heure</th>
                <th scope="col" className="text-right px-5 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {REPORTS.map((r) => {
                const c = STATUS_CONFIG[r.status];
                return (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-semibold text-brand-navy">#{r.id}</td>
                    <td className="px-5 py-3 text-brand-navy">{r.contact}</td>
                    <td className="px-5 py-3 text-gray-600">{r.problem}</td>
                    <td className="px-5 py-3 text-gray-600">{r.amount}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/signalements/${r.id}`}
                        className={`inline-flex items-center gap-1.5 rounded-pill ${c.pill} ${c.text} px-3 py-1 text-xs font-semibold hover:opacity-80 transition-opacity`}
                      >
                        {c.label}
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{REPORTS.length} signalements sur la période sélectionnée</span>
          <div className="flex items-center gap-1">
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100" disabled>‹</button>
            <button type="button" className="px-2.5 py-1 rounded bg-brand-navy text-white font-semibold shadow-glow-navy">1</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-gray-100" disabled>›</button>
          </div>
        </div>
      </section>
    </div>
  );
}
