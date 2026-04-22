import type { Metadata } from 'next';
import Link from 'next/link';
import { BellRing, Phone, Mail, Globe, Trash2, Archive } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { DemoBanner } from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: 'Mes alertes',
  description:
    'Suivez les alertes sur les contacts que vous surveillez et recevez une notification à chaque nouveau signalement.',
};

const DEMO_ALERTS = [
  {
    id: '1',
    Icon: Phone,
    contact: '+212 6 12 34 •• ••',
    summary: '2 nouveaux signalements sur ce numéro cette semaine.',
    date: 'il y a 2h',
    count: 5,
    riskColor: 'border-l-red-500',
  },
  {
    id: '2',
    Icon: Mail,
    contact: 'contact@arnaqu••.com',
    summary: 'Signalement "Non livraison" ajouté par un autre utilisateur.',
    date: 'hier',
    count: 3,
    riskColor: 'border-l-orange-500',
  },
  {
    id: '3',
    Icon: Globe,
    contact: 'https://boutique-sus••.ma',
    summary: 'Vigilance : 1 nouveau signalement "Produit non conforme".',
    date: 'il y a 3 jours',
    count: 1,
    riskColor: 'border-l-yellow-500',
  },
];

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Mes alertes"
        subtitle="Suivez les contacts que vous surveillez et soyez notifié à chaque nouveau signalement."
      />
      <DemoBanner />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {DEMO_ALERTS.length} alertes actives · 3 nouvelles notifications
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-4 py-1.5 text-sm font-medium hover:border-brand-blue transition-colors"
        >
          <BellRing className="h-4 w-4" aria-hidden />
          Gérer les notifications
        </button>
      </div>

      <div className="space-y-3">
        {DEMO_ALERTS.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl bg-white border border-gray-200 border-l-4 ${a.riskColor} p-4 flex items-start gap-4`}
          >
            <div className="h-10 w-10 rounded-xl bg-brand-sky flex items-center justify-center shrink-0">
              <a.Icon className="h-5 w-5 text-brand-navy" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-brand-navy truncate">{a.contact}</p>
              <p className="mt-1 text-sm text-gray-500">{a.summary}</p>
              <p className="mt-2 text-xs text-gray-400">
                {a.count} signalements similaires · {a.date}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Link
                href={`/mes-signalements/${a.id}`}
                className="rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue transition-colors"
              >
                Voir les détails
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy"
              >
                <Archive className="h-3 w-3" aria-hidden />
                Archiver
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" aria-hidden />
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
