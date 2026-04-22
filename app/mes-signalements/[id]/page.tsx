import type { Metadata } from 'next';
import { Pencil, Trash2, Paperclip } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: 'Détail du signalement',
  description: 'Consultez le détail complet de votre signalement et son évolution.',
};

type PageProps = { params: { id: string } };

const STEPS = [
  { label: 'Signalement envoyé', date: '20 avril 2026', color: 'bg-yellow-500', done: true },
  { label: 'En cours d’examen', date: '21 avril 2026', color: 'bg-orange-500', done: true },
  { label: 'Publié', date: 'En attente', color: 'bg-gray-200', done: false },
];

export default function Page({ params }: PageProps) {
  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton href="/mes-signalements" label="Mes signalements" />
      </div>
      <DemoBanner />

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="inline-flex items-center rounded-pill bg-orange-100 text-orange-700 px-2.5 py-0.5 text-xs font-semibold">
          En cours d&apos;examen
        </span>
        <span className="text-xs font-medium text-brand-navy rounded-pill bg-brand-sky/60 px-2.5 py-0.5">
          Non livraison
        </span>
        <span className="text-xs text-gray-400">Signalement #{params.id}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
        +212 6 12 34 •• ••
      </h1>
      <p className="mt-2 text-sm text-gray-500">Téléphone — soumis le 20 avril 2026</p>

      <div className="mt-8 rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Timeline
        </h2>
        <ol className="relative flex items-center justify-between">
          {STEPS.map((s, i) => (
            <li
              key={s.label}
              className="flex-1 flex flex-col items-center text-center relative"
            >
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute left-0 right-1/2 top-3 h-[2px] ${
                    s.done ? 'bg-brand-blue' : 'bg-gray-200'
                  } border-dashed`}
                />
              )}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute right-0 left-1/2 top-3 h-[2px] ${
                    STEPS[i + 1]?.done ? 'bg-brand-blue' : 'bg-gray-200'
                  }`}
                />
              )}
              <span className={`relative z-10 h-6 w-6 rounded-full ${s.color} shadow`} />
              <p className="mt-2 text-xs font-semibold text-brand-navy">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.date}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-3">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Commande effectuée le 1er avril, vendeur n&apos;a jamais livré le produit et ne répond
              plus à mes messages depuis 3 semaines malgré plusieurs relances.
            </p>
          </section>

          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-3">Preuves fournies</h2>
            <ul className="space-y-2">
              {['screenshot-whatsapp-01.png', 'recu-paiement.pdf', 'conversation-email.png'].map(
                (f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-brand-navy"
                  >
                    <Paperclip className="h-4 w-4 text-gray-400" aria-hidden />
                    {f}
                  </li>
                ),
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Informations
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium text-brand-navy">Téléphone</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Problème</dt>
                <dd className="font-medium text-brand-navy">Non livraison</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Montant</dt>
                <dd className="font-medium text-brand-navy">2 500 MAD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Statut</dt>
                <dd className="font-medium text-orange-600">En cours d&apos;examen</dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-navy shadow-glow-blue hover:shadow-glow-navy transition-all"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Modifier
          </button>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-pill border border-red-500 text-red-500 px-5 py-2.5 text-sm font-semibold hover:bg-red-500 hover:text-white shadow-glow-soft hover:shadow-glow-red transition-all"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Supprimer
          </button>
        </aside>
      </div>
    </PageLayout>
  );
}
