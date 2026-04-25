import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Phone,
  Mail,
  Globe,
  CreditCard,
  Clock3,
  Archive,
  Trash2,
  PackageX,
  Lock,
  PackageCheck,
  UserX,
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';

export const metadata: Metadata = {
  title: 'Détail de l’alerte',
  description:
    'Consultez le détail d’un contact que vous suivez : nombre de signalements, types de problèmes, dernières alertes.',
};

type RiskLevel = 'low' | 'vigilance' | 'moderate' | 'high';

type AlertDetail = {
  id: string;
  channel: 'phone' | 'email' | 'web' | 'rib';
  contact: string;
  contactLabel: string;
  risk: RiskLevel;
  totalReports: number;
  lastReportRelative: string;
  byCategory: {
    nonLivraison: number;
    bloqueApresPaiement: number;
    produitNonConforme: number;
    usurpation: number;
  };
};

// Demo data — same ids as in components/AlertsPopover and the alerts list page.
const DEMO: Record<string, AlertDetail> = {
  '1': {
    id: '1',
    channel: 'phone',
    contact: '+212 6 12 34 •• ••',
    contactLabel: 'Téléphone',
    risk: 'low',
    totalReports: 1,
    lastReportRelative: 'il y a 3 heures',
    byCategory: { nonLivraison: 1, bloqueApresPaiement: 0, produitNonConforme: 0, usurpation: 0 },
  },
  '2': {
    id: '2',
    channel: 'email',
    contact: 'contact@arnaqu••.com',
    contactLabel: 'Email',
    risk: 'moderate',
    totalReports: 3,
    lastReportRelative: 'hier',
    byCategory: { nonLivraison: 1, bloqueApresPaiement: 1, produitNonConforme: 1, usurpation: 0 },
  },
  '3': {
    id: '3',
    channel: 'web',
    contact: 'https://boutique-sus••.ma',
    contactLabel: 'Site web',
    risk: 'vigilance',
    totalReports: 1,
    lastReportRelative: 'il y a 3 jours',
    byCategory: { nonLivraison: 0, bloqueApresPaiement: 0, produitNonConforme: 1, usurpation: 0 },
  },
};

const FALLBACK: AlertDetail = {
  id: '0',
  channel: 'rib',
  contact: '50XX XXXX XXXX XX86',
  contactLabel: 'RIB',
  risk: 'high',
  totalReports: 5,
  lastReportRelative: 'il y a 2 heures',
  byCategory: { nonLivraison: 1, bloqueApresPaiement: 2, produitNonConforme: 2, usurpation: 0 },
};

const CHANNEL_ICON = {
  phone: Phone,
  email: Mail,
  web: Globe,
  rib: CreditCard,
} as const;

const RISK_BAR: Record<RiskLevel, string> = {
  low: 'bg-green-500',
  vigilance: 'bg-yellow-300',
  moderate: 'bg-orange-500',
  high: 'bg-red-500',
};

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Risque faible',
  vigilance: 'Vigilance',
  moderate: 'Risque modéré',
  high: 'Risque élevé',
};

export default function Page({ params }: { params: { id: string } }) {
  const alert = DEMO[params.id] ?? { ...FALLBACK, id: params.id };
  const Icon = CHANNEL_ICON[alert.channel];
  const isHighRisk = alert.risk === 'high';

  return (
    <PageLayout narrow>
      <div className="mb-8">
        <BackButton href="/mes-alertes" label="Mes alertes" />
      </div>
      <DemoBanner />

      {/* Header — channel + contact + risk pill */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-xs font-medium text-brand-navy rounded-pill bg-brand-sky/60 px-2.5 py-0.5">
          {alert.contactLabel}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-xs font-semibold text-white ${RISK_BAR[alert.risk]}`}
        >
          {RISK_LABEL[alert.risk]}
        </span>
        <span className="text-xs text-gray-400">Alerte #{alert.id}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy break-all">
        {alert.contact}
      </h1>
      <p className="mt-2 text-sm text-gray-500 inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5" aria-hidden />
        Dernier signalement : {alert.lastReportRelative}
      </p>

      {/* Main detail card — colored bar + summary + 4 KPIs */}
      <div className="mt-8 relative rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-glow-soft">
        <span
          className={`absolute left-0 top-0 bottom-0 w-1.5 ${RISK_BAR[alert.risk]}`}
          aria-hidden
        />

        <div className="p-6 pl-7">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-sky flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-brand-navy" aria-hidden />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-lg font-bold ${isHighRisk ? 'text-red-700' : 'text-brand-navy'}`}
              >
                {alert.totalReports}{' '}
                {alert.totalReports > 1 ? 'signalements enregistrés' : 'signalement enregistré'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Dernier signalement : {alert.lastReportRelative}
              </p>
            </div>
          </div>

          {/* 4 KPI cards by category */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              icon={PackageX}
              label="Non livraison"
              value={alert.byCategory.nonLivraison}
            />
            <KpiCard
              icon={Lock}
              label="Bloqué après paiement"
              value={alert.byCategory.bloqueApresPaiement}
            />
            <KpiCard
              icon={PackageCheck}
              label="Produit non conforme"
              value={alert.byCategory.produitNonConforme}
            />
            <KpiCard
              icon={UserX}
              label="Usurpation d'identité"
              value={alert.byCategory.usurpation}
            />
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-4 py-2 text-sm font-medium hover:border-brand-blue hover:bg-gray-50 transition-colors"
        >
          <Archive className="h-4 w-4" aria-hidden />
          Archiver l&apos;alerte
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-pill border border-red-100 text-red-500 px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Ne plus suivre ce contact
        </button>
        <Link
          href="/recherche"
          className="ml-auto text-sm font-semibold text-brand-blue hover:underline"
        >
          Voir tous les signalements →
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-gray-400 max-w-2xl mx-auto">
        Les informations affichées sont basées sur les signalements et les expériences des
        utilisateurs, vérifiées lorsque cela est possible, et fournies à titre indicatif uniquement.
      </p>
    </PageLayout>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PackageX;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-3 flex flex-col items-start gap-2">
      <span className="inline-flex items-center gap-1 rounded-pill bg-red-500 text-white px-2 py-0.5 text-[10px] font-semibold">
        <Icon className="h-3 w-3" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-2xl font-bold text-brand-navy">{value}</span>
    </div>
  );
}
