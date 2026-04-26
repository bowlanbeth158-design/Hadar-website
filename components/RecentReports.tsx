import { UserRound, Clock } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

type RiskLevel = 'vigilance' | 'modere' | 'eleve';

type DemoReport = {
  id: string;
  title: string;
  description: string;
  similar: number;
  date: string;
  risk: RiskLevel;
};

const DEMO_REPORTS: DemoReport[] = [
  {
    id: 'd1',
    title: 'Signalement avec éléments fournis',
    description:
      'Ce contact demande un paiement via PayPal puis cesse de répondre après réception.',
    similar: 5,
    date: 'il y a 1 jour',
    risk: 'eleve',
  },
  {
    id: 'd2',
    title: 'Signalement avec éléments fournis',
    description:
      'Site de vente qui encaisse le paiement sans jamais livrer la commande ni répondre au support.',
    similar: 8,
    date: 'il y a 2 jours',
    risk: 'eleve',
  },
  {
    id: 'd3',
    title: 'Signalement avec éléments fournis',
    description:
      'Faux compte se faisant passer pour un marchand officiel pour vendre des produits contrefaits.',
    similar: 3,
    date: 'il y a 3 jours',
    risk: 'modere',
  },
  {
    id: 'd4',
    title: 'Signalement avec éléments fournis',
    description:
      'Produit reçu totalement différent de la description initiale, et vendeur refusant le remboursement.',
    similar: 2,
    date: 'il y a 4 jours',
    risk: 'vigilance',
  },
  {
    id: 'd5',
    title: 'Signalement avec éléments fournis',
    description:
      'Numéro WhatsApp utilisé pour fausses promotions, redirige vers un site de phishing.',
    similar: 12,
    date: 'il y a 5 jours',
    risk: 'eleve',
  },
  {
    id: 'd6',
    title: 'Signalement avec éléments fournis',
    description:
      'RIB partagé dans un groupe Telegram pour recevoir des paiements puis disparition du contact.',
    similar: 4,
    date: 'il y a 6 jours',
    risk: 'modere',
  },
];

type RiskStyle = {
  dot: string;
  bg: string;
  text: string;
  border: string;
  stripe: string;
  label: string;
};

const RISK_STYLE: Record<RiskLevel, RiskStyle> = {
  vigilance: {
    dot: 'bg-yellow-300',
    bg: 'bg-yellow-100',
    text: 'text-yellow-500',
    border: 'border-yellow-500/40',
    stripe: 'bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-100',
    label: 'Vigilance',
  },
  modere: {
    dot: 'bg-orange-500',
    bg: 'bg-orange-100',
    text: 'text-orange-500',
    border: 'border-orange-500/40',
    stripe: 'bg-gradient-to-r from-orange-500 via-orange-500 to-orange-100',
    label: 'Modéré',
  },
  eleve: {
    dot: 'bg-red-500',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-500/40',
    stripe: 'bg-gradient-to-r from-red-500 via-red-500 to-red-100',
    label: 'Élevé',
  },
};

export function RecentReports() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-6 py-10 md:py-14">
      {/* "Live update" badge — same shimmer-pill recipe as the banner pill */}
      <div className="flex justify-center">
        <span className="relative inline-flex items-center gap-2 rounded-pill border border-white/70 bg-gradient-to-r from-brand-sky via-blue-100 to-brand-sky text-brand-navy px-3 py-1 text-xs font-semibold shadow-sm overflow-hidden">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="relative z-10">Mis à jour en direct</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-20deg] animate-shimmer"
          />
        </span>
      </div>

      <h2 className="mt-3 text-2xl md:text-3xl font-bold bg-grad-stat-navy bg-clip-text text-transparent text-center">
        Signalements récents de la communauté
      </h2>

      <p className="mt-2 text-sm text-gray-500 text-center">
        Les 6 derniers signalements publiés par la communauté
      </p>

      <div className="mt-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        <ul className="flex gap-4">
          {DEMO_REPORTS.map((r, i) => {
            const style = RISK_STYLE[r.risk];
            return (
              <li
                key={r.id}
                className="snap-start shrink-0 w-[82%] sm:w-[48%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] animate-fade-in-down"
                style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}
              >
                <article
                  className="group relative h-full rounded-2xl bg-white border border-gray-200 p-5 pt-6 flex flex-col shadow-glow-soft hover:shadow-glow-navy hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden"
                >
                  {/* Risk-coloured top stripe — gradient fades to the right
                      so the colour reads as an accent, not a heavy border. */}
                  <div
                    aria-hidden
                    className={`absolute top-0 inset-x-0 h-1 ${style.stripe}`}
                  />

                  {/* Shimmer light passes diagonally across on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"
                  />

                  <div className="flex items-start justify-between mb-3 relative">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-sky via-blue-100 to-brand-sky flex items-center justify-center border border-brand-blue/20 shadow-sm group-hover:scale-110 transition-transform"
                      >
                        <UserRound className="h-4 w-4 text-brand-navy" aria-hidden />
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        Utilisateur anonyme
                      </span>
                    </div>

                    {/* Risk badge — pill with pulsing dot in the matching colour */}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-pill ${style.bg} ${style.text} border ${style.border} px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide`}
                      aria-label={`Niveau de risque : ${style.label}`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${style.dot} opacity-60`}
                        />
                        <span
                          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${style.dot}`}
                        />
                      </span>
                      {style.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-brand-navy flex items-start gap-1.5 relative">
                    <VerifiedBadge className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{r.title}</span>
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1 relative">
                    {r.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs border-t border-gray-100 pt-3 relative">
                    <span className="inline-flex items-center gap-1 text-gray-500">
                      <span className="font-bold text-base bg-gradient-to-r from-brand-navy to-brand-blue bg-clip-text text-transparent tabular-nums">
                        {r.similar}
                      </span>
                      <span className="text-gray-400">similaires</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <Clock className="h-3 w-3" aria-hidden />
                      {r.date}
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center max-w-3xl mx-auto">
        Les contenus sont examinés avant publication et peuvent être modifiés ou supprimés
        s&apos;ils ne respectent pas nos règles.
      </p>
    </section>
  );
}
