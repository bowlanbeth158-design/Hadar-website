import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { PageHeading } from '@/components/PageHeading';
import { DemoBanner } from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: 'Mes signalements',
  description: 'Consultez et gérez les signalements que vous avez soumis.',
};

const TABS = [
  { id: 'tous', label: 'Tous', count: 15 },
  { id: 'en_attente', label: 'En attente', count: 2 },
  { id: 'publies', label: 'Publiés', count: 11 },
  { id: 'a_corriger', label: 'À corriger', count: 1 },
  { id: 'refuses', label: 'Refusés', count: 1 },
];

const STATUS_STYLES: Record<
  string,
  { label: string; border: string; badge: string }
> = {
  publie: {
    label: 'Publié',
    border: 'border-l-green-500',
    badge: 'bg-green-100 text-green-700',
  },
  en_attente: {
    label: 'En attente',
    border: 'border-l-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  a_corriger: {
    label: 'À corriger',
    border: 'border-l-orange-500',
    badge: 'bg-orange-100 text-orange-700',
  },
  refuse: {
    label: 'Refusé',
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700',
  },
};

const DEMO_REPORTS = [
  {
    id: '1',
    contact: '+212 6 12 34 •• ••',
    problem: 'Non livraison',
    description: 'Commande non reçue après 3 semaines, vendeur ne répond plus.',
    date: 'il y a 3 jours',
    status: 'publie',
  },
  {
    id: '2',
    contact: 'contact@arnaqu••.com',
    problem: 'Bloqué après paiement',
    description: 'Contact bloqué dès que le paiement a été reçu.',
    date: 'hier',
    status: 'en_attente',
  },
  {
    id: '3',
    contact: 'https://boutique-sus••.ma',
    problem: 'Produit non conforme',
    description: 'Produit reçu ne correspond pas du tout à la description.',
    date: 'il y a 5 jours',
    status: 'a_corriger',
  },
  {
    id: '4',
    contact: 'paypal-us••@gmail.com',
    problem: "Usurpation d'identité",
    description: 'Se fait passer pour un marchand officiel.',
    date: 'il y a 2 semaines',
    status: 'refuse',
  },
];

export default function Page() {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton />
      </div>
      <PageHeading
        title="Mes signalements"
        subtitle="Suivez le statut de vos signalements et apportez des corrections si nécessaire."
      />
      <DemoBanner />

      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={
              i === 0
                ? 'inline-flex items-center gap-2 rounded-pill bg-brand-navy text-white px-4 py-1.5 text-sm font-medium'
                : 'inline-flex items-center gap-2 rounded-pill bg-white border border-gray-200 text-brand-navy px-4 py-1.5 text-sm font-medium hover:border-brand-blue transition-colors'
            }
          >
            {t.label}
            <span
              className={
                i === 0
                  ? 'text-xs bg-white/20 rounded-full px-2'
                  : 'text-xs bg-gray-100 text-gray-500 rounded-full px-2'
              }
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {DEMO_REPORTS.map((r) => {
          const s = STATUS_STYLES[r.status]!;
          return (
            <div
              key={r.id}
              className={`rounded-2xl bg-white border border-gray-200 border-l-4 ${s.border} p-5 shadow-glow-soft hover:shadow-glow-navy transition-all`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs font-medium text-brand-navy rounded-pill bg-brand-sky/60 px-2.5 py-0.5">
                      {r.problem}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-brand-navy">{r.contact}</p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{r.description}</p>
                  <p className="mt-2 text-xs text-gray-400">Soumis {r.date}</p>
                </div>
                <Link
                  href={`/mes-signalements/${r.id}`}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-4 py-1.5 text-sm font-semibold hover:bg-brand-navy hover:text-white shadow-glow-soft hover:shadow-glow-navy transition-all"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  Voir les détails
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}
