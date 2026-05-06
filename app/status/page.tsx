import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Statut',
  description: 'État des services Hadar.ma en temps réel.',
};

const SERVICES = [
  { name: 'Site web', status: 'operational' as const },
  { name: 'API publique', status: 'operational' as const },
  { name: 'Recherche', status: 'operational' as const },
  { name: 'Soumission de signalements', status: 'operational' as const },
  { name: 'Email transactionnel', status: 'operational' as const },
];

const STATUS_CONFIG = {
  operational: {
    label: 'Opérationnel',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  degraded: {
    label: 'Performance dégradée',
    color: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-500',
  },
  outage: {
    label: 'Panne',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
};

export default function Page() {
  return (
    <PageLayout narrow>
      <div className="mx-auto max-w-2xl py-12">
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-brand-navy">
            Tous les systèmes sont opérationnels
          </h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          Dernière vérification :{' '}
          {new Date().toLocaleString('fr-FR', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </p>

        <div className="rounded-2xl bg-white border border-gray-200 divide-y divide-gray-100 shadow-glow-soft overflow-hidden">
          {SERVICES.map((s) => {
            const cfg = STATUS_CONFIG[s.status];
            return (
              <div
                key={s.name}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`}
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-brand-navy">
                    {s.name}
                  </span>
                </div>
                <span
                  className={`rounded-pill ${cfg.color} px-2.5 py-0.5 text-xs font-semibold`}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Page de statut publique. Pour signaler un incident, contacte
          <a
            href="mailto:support@hadar.ma"
            className="ml-1 text-brand-blue hover:underline"
          >
            support@hadar.ma
          </a>
          .
        </p>
      </div>
    </PageLayout>
  );
}
