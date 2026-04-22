import type { Metadata } from 'next';
import {
  RefreshCw,
  Download,
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

export const metadata: Metadata = {
  title: 'Dashboard',
};

const PERIODS = ['Aujourd’hui', 'Hier', '7 jours', '30 jours', '365 jours', 'Personnalisé'];

const KPIS: { value: string; label: string; gradient: string; Icon: LucideIcon }[] = [
  { value: '25', label: 'Total Signalements', gradient: 'bg-grad-stat-violet', Icon: Siren },
  { value: '8', label: 'En attente', gradient: 'bg-grad-stat-orange', Icon: Clock },
  { value: '13', label: 'Publiés', gradient: 'bg-grad-stat-green', Icon: Copy },
  { value: '4', label: 'Refusés', gradient: 'bg-grad-stat-red', Icon: XCircle },
];

const PROBLEM_KPIS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: '5', label: 'Non livraison', Icon: FileX2 },
  { value: '13', label: 'Bloqué après paiement', Icon: CreditCard },
  { value: '3', label: 'Produit non conforme', Icon: FileWarning },
  { value: '4', label: "Usurpation d'identité", Icon: VenetianMask },
];

const CHANNELS = [
  { label: 'Téléphone', count: 1 },
  { label: 'Réseaux sociaux', count: 8 },
  { label: 'WhatsApp', count: 8 },
  { label: 'Binance', count: 1 },
  { label: 'Email', count: 1 },
  { label: 'PayPal', count: 0 },
  { label: 'Site web', count: 2 },
  { label: 'RIB', count: 3 },
];

export default function Page() {
  const processingRate = 68;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold transition-colors"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Rafraîchir
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand-navy hover:bg-brand-blue text-white px-4 py-1.5 text-sm font-semibold transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden />
            Exporter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {PERIODS.map((p, i) => (
          <button
            key={p}
            type="button"
            className={
              i === 0
                ? 'rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium'
                : 'rounded-pill bg-brand-sky/60 text-brand-navy px-4 py-1.5 text-sm font-medium hover:bg-brand-sky'
            }
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className={`${k.gradient} text-white rounded-2xl p-5 shadow-sm flex items-center justify-between`}
          >
            <div>
              <p className="text-4xl font-bold">{k.value}</p>
              <p className="mt-1 text-sm font-medium opacity-90">{k.label}</p>
            </div>
            <k.Icon className="h-9 w-9 opacity-70" aria-hidden />
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-brand-navy">Taux de traitement</p>
          <p className="text-sm font-bold text-brand-navy">{processingRate}%</p>
        </div>
        <div className="h-2 rounded-pill bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-brand-navy rounded-pill"
            style={{ width: `${processingRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          (Publiés + Refusés) / Total — indique la réactivité de l’équipe de modération.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {PROBLEM_KPIS.map((p) => (
          <div
            key={p.label}
            className="rounded-2xl bg-white border border-gray-200 p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-4xl font-bold text-brand-blue">{p.value}</p>
              <p className="mt-1 text-sm text-gray-500">{p.label}</p>
            </div>
            <p.Icon className="h-7 w-7 text-gray-400" aria-hidden />
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 p-5">
        <p className="text-sm font-semibold text-brand-navy mb-3">Taux de problème par canal</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {CHANNELS.map((c, i) => (
            <button
              key={c.label}
              type="button"
              className={
                i === 2
                  ? 'flex items-center justify-between gap-2 rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium'
                  : 'flex items-center justify-between gap-2 rounded-pill bg-white border border-sky-500 text-brand-navy px-4 py-1.5 text-sm font-medium hover:bg-brand-sky/30 transition-colors'
              }
            >
              <span>{c.label}</span>
              <span
                className={
                  i === 2
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
          <div className="h-full bg-brand-blue rounded-pill" style={{ width: '42%' }} />
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Canal actif : WhatsApp — 42% des signalements sur la période sélectionnée.
        </p>
      </section>
    </div>
  );
}
