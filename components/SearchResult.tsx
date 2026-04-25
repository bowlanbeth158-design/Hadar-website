import { CheckCircle2 } from 'lucide-react';

type Props = {
  query: string;
};

type RiskLevel = 'faible' | 'vigilance' | 'modere' | 'eleve';

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; pillBg: string; pillText: string; pillLabel: string; message: string; dotIndex: number }
> = {
  faible: {
    label: 'Risque faible',
    pillBg: 'bg-green-100',
    pillText: 'text-green-700',
    pillLabel: 'Aucun signalement détecté',
    message: 'Vous pouvez poursuivre vos vérifications pour prendre une décision éclairée.',
    dotIndex: 0,
  },
  vigilance: {
    label: 'Vigilance requise',
    pillBg: 'bg-yellow-100',
    pillText: 'text-yellow-700',
    pillLabel: 'Signalements détectés',
    message:
      'Quelques signalements ont été enregistrés. Vérifiez les informations avant de continuer.',
    dotIndex: 1,
  },
  modere: {
    label: 'Risque modéré',
    pillBg: 'bg-orange-100',
    pillText: 'text-orange-600',
    pillLabel: 'Plusieurs signalements',
    message:
      'Plusieurs signalements ont été enregistrés. La prudence est recommandée avant toute interaction.',
    dotIndex: 2,
  },
  eleve: {
    label: 'Risque élevé',
    pillBg: 'bg-red-100',
    pillText: 'text-red-700',
    pillLabel: 'Signalements nombreux',
    message:
      'Un nombre important de signalements a été enregistré. Soyez particulièrement vigilant.',
    dotIndex: 3,
  },
};

const DOT_COLORS = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

const KPIS = [
  { label: 'Non livraison', count: 0 },
  { label: 'Bloqué après paiement', count: 0 },
  { label: 'Produit non conforme', count: 0 },
  { label: "Usurpation d'identité", count: 0 },
];

export function SearchResult({ query }: Props) {
  const risk: RiskLevel = 'faible';
  const cfg = RISK_CONFIG[risk];
  const totalReports = 0;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200/70" aria-label="Résultat de recherche">
      <p className="sr-only">Résultat pour {query}</p>

      <div className="flex justify-center mb-4">
        <div
          className={`inline-flex items-center gap-2 rounded-pill ${cfg.pillBg} ${cfg.pillText} px-4 py-2 text-sm font-semibold shadow-glow-green`}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {cfg.pillLabel}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-6">
        <span>
          <span className="font-semibold text-gray-900">{totalReports}</span> signalement ·{' '}
          <span className={cfg.pillText}>{cfg.label}</span>
        </span>
        <div className="flex items-center gap-1.5" aria-label={`Niveau de risque : ${cfg.label}`}>
          {DOT_COLORS.map((color, i) => (
            <span
              key={color}
              className={`h-2.5 w-2.5 rounded-full ${color} ${
                i === cfg.dotIndex ? 'shadow-md' : 'opacity-25'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl bg-white border border-gray-200 p-5 text-center shadow-glow-soft"
          >
            <p className="text-4xl font-bold text-gray-900">{kpi.count}</p>
            <p className="mt-1 text-sm text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <p className={`mt-6 text-center text-sm font-medium ${cfg.pillText}`}>{cfg.message}</p>
    </div>
  );
}
