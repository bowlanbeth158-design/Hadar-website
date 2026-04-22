import { CheckCircle2, UserRound } from 'lucide-react';

const DEMO_REPORTS = [
  {
    id: 'd1',
    title: 'Signalement avec éléments fournis',
    description:
      'Ce contact demande un paiement via PayPal puis cesse de répondre après réception.',
    similar: 5,
    date: 'il y a 1 jour',
    dots: ['bg-yellow-500', 'bg-red-500'],
  },
  {
    id: 'd2',
    title: 'Signalement avec éléments fournis',
    description:
      'Site de vente qui encaisse le paiement sans jamais livrer la commande ni répondre au support.',
    similar: 8,
    date: 'il y a 2 jours',
    dots: ['bg-yellow-500', 'bg-red-500'],
  },
  {
    id: 'd3',
    title: 'Signalement avec éléments fournis',
    description:
      'Faux compte se faisant passer pour un marchand officiel pour vendre des produits contrefaits.',
    similar: 3,
    date: 'il y a 3 jours',
    dots: ['bg-yellow-500', 'bg-red-500'],
  },
  {
    id: 'd4',
    title: 'Signalement avec éléments fournis',
    description:
      'Produit reçu totalement différent de la description initiale, et vendeur refusant le remboursement.',
    similar: 2,
    date: 'il y a 4 jours',
    dots: ['bg-yellow-500', 'bg-red-500'],
  },
];

export function RecentReports() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <h2 className="text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Signalements récents de la communauté
      </h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_REPORTS.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl bg-white border border-gray-200 p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <UserRound className="h-4 w-4 text-gray-400" aria-hidden />
                </span>
                <span className="text-xs font-medium text-gray-500">Utilisateur anonyme</span>
              </div>
              <div className="flex items-center gap-1" aria-hidden>
                {r.dots.map((c, i) => (
                  <span key={i} className={`h-2 w-2 rounded-full ${c}`} />
                ))}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-brand-navy flex items-start gap-1.5">
              <CheckCircle2
                className="h-4 w-4 text-green-500 shrink-0 mt-0.5"
                aria-hidden
              />
              <span>{r.title}</span>
            </h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1">{r.description}</p>

            <p className="mt-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span className="font-semibold text-brand-blue">{r.similar}</span> signalements
              similaires · {r.date}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center max-w-3xl mx-auto">
        Les contenus sont examinés avant publication et peuvent être modifiés ou supprimés
        s&apos;ils ne respectent pas nos règles.
      </p>
    </section>
  );
}
