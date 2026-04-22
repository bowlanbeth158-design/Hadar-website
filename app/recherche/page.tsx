import type { Metadata } from 'next';
import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Résultat de recherche',
  description: 'Résultat de la vérification de contact sur Hadar.ma.',
};

type SearchParams = { q?: string };

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const query = searchParams.q?.trim() ?? '';

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-navy">
            Résultat de vérification
          </h1>
          {query ? (
            <p className="mt-3 text-gray-500">
              Pour <span className="font-semibold text-brand-navy">{query}</span>
            </p>
          ) : (
            <p className="mt-3 text-gray-500">Aucune recherche effectuée.</p>
          )}
        </div>

        <div className="mt-10">
          <div className="inline-flex items-center gap-2 rounded-pill bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
            <span aria-hidden>✓</span> Aucun signalement détecté
          </div>

          <div className="mt-6 rounded-2xl bg-white border border-gray-200 p-6">
            <div className="flex items-center gap-6 justify-between flex-wrap">
              <div>
                <p className="text-sm text-gray-500">0 signalement · Risque faible</p>
                <p className="mt-2 text-brand-navy font-medium">
                  Aucun signalement détecté. Vous pouvez continuer, tout en restant vigilant.
                </p>
              </div>
              <div className="flex items-center gap-2" aria-label="Niveau de risque">
                <span className="h-4 w-4 rounded-full bg-green-500 shadow" title="Faible" />
                <span className="h-4 w-4 rounded-full bg-yellow-300/40" title="Vigilance" />
                <span className="h-4 w-4 rounded-full bg-orange-500/30" title="Modéré" />
                <span className="h-4 w-4 rounded-full bg-red-500/30" title="Élevé" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Non livraison', count: 0 },
              { label: 'Bloqué après paiement', count: 0 },
              { label: 'Produit non conforme', count: 0 },
              { label: "Usurpation d'identité", count: 0 },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl bg-white border border-gray-200 p-4 text-center"
              >
                <p className="text-3xl font-bold text-brand-navy">{kpi.count}</p>
                <p className="mt-1 text-xs text-gray-500">{kpi.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-pill border border-gray-200 bg-white text-brand-navy px-5 py-2 text-sm font-semibold hover:border-brand-blue transition-colors"
            >
              Nouvelle recherche
            </Link>
            <Link
              href="/signaler"
              className="rounded-pill bg-red-500 hover:bg-red-700 text-white px-5 py-2 text-sm font-semibold transition-colors"
            >
              Signaler ce contact
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
