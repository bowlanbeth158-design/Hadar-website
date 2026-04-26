import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  type LucideIcon,
} from 'lucide-react';

type Props = {
  query: string;
};

type RiskLevel = 'faible' | 'vigilance' | 'modere' | 'eleve';

type RiskConfig = {
  label: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  pillLabel: string;
  message: string;
  dotIndex: number;
  Icon: LucideIcon;
  iconAnim: string;
  pillAnim: string;
  pillGlow: string;
};

const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  faible: {
    label: 'Risque faible',
    pillBg: 'bg-green-100',
    pillText: 'text-green-700',
    pillBorder: 'border-green-500/30',
    pillLabel: 'Aucun signalement détecté',
    message: 'Vous pouvez poursuivre vos vérifications pour prendre une décision éclairée.',
    dotIndex: 0,
    Icon: CheckCircle2,
    iconAnim: 'animate-sparkle-pop',
    pillAnim: 'animate-verify-pulse',
    pillGlow: 'shadow-glow-green',
  },
  vigilance: {
    label: 'Vigilance requise',
    pillBg: 'bg-yellow-100',
    pillText: 'text-yellow-500',
    pillBorder: 'border-yellow-500/40',
    pillLabel: 'Signalements détectés',
    message:
      'Quelques signalements ont été enregistrés. Vérifiez les informations avant de continuer.',
    dotIndex: 1,
    Icon: AlertCircle,
    iconAnim: 'animate-sparkle-pop',
    pillAnim: 'animate-pulse-yellow',
    pillGlow: 'shadow-glow-yellow',
  },
  modere: {
    label: 'Risque modéré',
    pillBg: 'bg-orange-100',
    pillText: 'text-orange-600',
    pillBorder: 'border-orange-500/40',
    pillLabel: 'Plusieurs signalements',
    message:
      'Plusieurs signalements ont été enregistrés. La prudence est recommandée avant toute interaction.',
    dotIndex: 2,
    Icon: AlertTriangle,
    iconAnim: 'animate-siren-wiggle',
    pillAnim: 'animate-pulse-orange',
    pillGlow: 'shadow-glow-orange',
  },
  eleve: {
    label: 'Risque élevé',
    pillBg: 'bg-red-100',
    pillText: 'text-red-700',
    pillBorder: 'border-red-500/40',
    pillLabel: 'Signalements nombreux',
    message:
      'Un nombre important de signalements a été enregistré. Soyez particulièrement vigilant.',
    dotIndex: 3,
    Icon: AlertOctagon,
    iconAnim: 'animate-siren-wiggle',
    pillAnim: 'animate-alert-pulse',
    pillGlow: 'shadow-glow-red',
  },
};

const DOT_COLORS = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

const KPI_LABELS = [
  'Non livraison',
  'Bloqué après paiement',
  'Produit non conforme',
  "Usurpation d'identité",
];

// Per-risk KPI counts and total. Wired as static demo values for now;
// will be swapped for the real /api/search response when the backend lands.
const KPIS_BY_RISK: Record<RiskLevel, number[]> = {
  faible: [0, 0, 0, 0],
  vigilance: [1, 0, 1, 0],
  modere: [3, 2, 1, 1],
  eleve: [8, 5, 3, 2],
};

const TOTAL_REPORTS: Record<RiskLevel, number> = {
  faible: 0,
  vigilance: 2,
  modere: 7,
  eleve: 18,
};

// Demo mapping: 4 known emails resolve to specific risk levels so the
// owner can preview the animation per tier. Anything else falls back
// to "faible".
function getRiskFromQuery(query: string): RiskLevel {
  const normalized = query.trim().toLowerCase();
  if (normalized === 'info@mushtarik01.com') return 'vigilance';
  if (normalized === 'info@mushtarik02.com') return 'modere';
  if (normalized === 'info@mushtarik03.com') return 'eleve';
  return 'faible';
}

export function SearchResult({ query }: Props) {
  const risk = getRiskFromQuery(query);
  const cfg = RISK_CONFIG[risk];
  const Icon = cfg.Icon;
  const kpis = KPIS_BY_RISK[risk];
  const totalReports = TOTAL_REPORTS[risk];
  const reportLabel = totalReports === 1 ? 'signalement' : 'signalements';

  return (
    <div
      key={risk}
      className="mt-8 pt-8 border-t border-gray-200/70 animate-fade-in-down"
      aria-label="Résultat de recherche"
    >
      <p className="sr-only">Résultat pour {query}</p>

      <div className="flex justify-center mb-4">
        <div
          className={`inline-flex items-center gap-2 rounded-pill ${cfg.pillBg} ${cfg.pillText} border ${cfg.pillBorder} px-4 py-2 text-sm font-semibold ${cfg.pillGlow} ${cfg.pillAnim}`}
        >
          <Icon className={`h-4 w-4 ${cfg.iconAnim}`} aria-hidden />
          {cfg.pillLabel}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mb-6">
        <span>
          <span className="font-semibold text-gray-900 tabular-nums">{totalReports}</span>{' '}
          {reportLabel} ·{' '}
          <span className={`${cfg.pillText} font-semibold`}>{cfg.label}</span>
        </span>
        <div className="flex items-center gap-1.5" aria-label={`Niveau de risque : ${cfg.label}`}>
          {DOT_COLORS.map((color, i) => {
            const isActive = i === cfg.dotIndex;
            return (
              <span
                key={color}
                className={`relative h-2.5 w-2.5 rounded-full ${color} ${
                  isActive ? 'shadow-md' : 'opacity-25'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-full ${color} animate-ping opacity-60`}
                  />
                )}
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_LABELS.map((label, i) => (
          <div
            key={label}
            className="rounded-2xl bg-white border border-gray-200 p-5 text-center shadow-glow-soft"
          >
            <p className="text-4xl font-bold text-gray-900 tabular-nums">{kpis[i] ?? 0}</p>
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <p
        key={`msg-${risk}`}
        className={`mt-6 text-center text-sm font-medium ${cfg.pillText} animate-fade-in-down`}
      >
        {cfg.message}
      </p>
    </div>
  );
}
