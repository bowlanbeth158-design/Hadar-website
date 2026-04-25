import { UserRound } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

const DEMO_REPORTS = [
  {
    id: 'd1',
    title: 'Signalement avec éléments fournis',
    description:
      'Ce contact demande un paiement via PayPal puis cesse de répondre après réception.',
    similar: 5,
    date: 'il y a 1 jour',
  },
  {
    id: 'd2',
    title: 'Signalement avec éléments fournis',
    description:
      'Site de vente qui encaisse le paiement sans jamais livrer la commande ni répondre au support.',
    similar: 8,
    date: 'il y a 2 jours',
  },
  {
    id: 'd3',
    title: 'Signalement avec éléments fournis',
    description:
      'Faux compte se faisant passer pour un marchand officiel pour vendre des produits contrefaits.',
    similar: 3,
    date: 'il y a 3 jours',
  },
  {
    id: 'd4',
    title: 'Signalement avec éléments fournis',
    description:
      'Produit reçu totalement différent de la description initiale, et vendeur refusant le remboursement.',
    similar: 2,
    date: 'il y a 4 jours',
  },
  {
    id: 'd5',
    title: 'Signalement avec éléments fournis',
    description:
      'Numéro WhatsApp utilisé pour fausses promotions, redirige vers un site de phishing.',
    similar: 12,
    date: 'il y a 5 jours',
  },
  {
    id: 'd6',
    title: 'Signalement avec éléments fournis',
    description:
      'RIB partagé dans un groupe Telegram pour recevoir des paiements puis disparition du contact.',
    similar: 4,
    date: 'il y a 6 jours',
  },
];

const DOTS = [
  { className: 'bg-yellow-500', label: 'Vigilance' },
  { className: 'bg-orange-500', label: 'Modéré' },
  { className: 'bg-red-500', label: 'Élevé' },
];

export function RecentReports() {
  return (
    <section className="mx-auto max-w-[1620px] px-4 md:px-6 py-10 md:py-14">
      <h2 className="text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Signalements récents de la communauté
      </h2>

      <div className="mt-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        <ul className="flex gap-4">
          {DEMO_REPORTS.map((r) => (
            <li
              key={r.id}
              className="snap-start shrink-0 w-[82%] sm:w-[48%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)]"
            >
              <article className="h-full rounded-2xl bg-white border border-gray-200 p-5 flex flex-col shadow-glow-soft hover:shadow-glow-navy transition-all">
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
                  <div className="flex items-center gap-1" aria-label="Niveau de risque">
                    {DOTS.map((d) => (
                      <span
                        key={d.label}
                        className={`h-2 w-2 rounded-full ${d.className}`}
                        title={d.label}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-brand-navy flex items-start gap-1.5">
                  <VerifiedBadge className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{r.title}</span>
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1">
                  {r.description}
                </p>

                <p className="mt-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  <span className="font-semibold text-brand-blue">{r.similar}</span> signalements
                  similaires · {r.date}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center max-w-3xl mx-auto">
        Les contenus sont examinés avant publication et peuvent être modifiés ou supprimés
        s&apos;ils ne respectent pas nos règles.
      </p>
    </section>
  );
}
