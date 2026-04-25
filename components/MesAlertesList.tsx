'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  Globe,
  Trash2,
  Archive,
  ChevronDown,
  PackageX,
  Lock,
  PackageCheck,
  UserX,
  Eye,
  EyeOff,
} from 'lucide-react';

type RiskLevel = 'low' | 'vigilance' | 'moderate' | 'high';

type Alert = {
  id: string;
  Icon: typeof Phone;
  contact: string;
  summary: string;
  date: string;
  count: number;
  risk: RiskLevel;
  lastReportRelative: string;
  byCategory: {
    nonLivraison: number;
    bloqueApresPaiement: number;
    produitNonConforme: number;
    usurpation: number;
  };
};

const DEMO_ALERTS: Alert[] = [
  {
    id: '1',
    Icon: Phone,
    contact: '+212 6 12 34 •• ••',
    summary: '2 nouveaux signalements sur ce numéro cette semaine.',
    date: 'il y a 2h',
    count: 5,
    risk: 'high',
    lastReportRelative: 'il y a 2 heures',
    byCategory: {
      nonLivraison: 1,
      bloqueApresPaiement: 2,
      produitNonConforme: 2,
      usurpation: 0,
    },
  },
  {
    id: '2',
    Icon: Mail,
    contact: 'contact@arnaqu••.com',
    summary: 'Signalement « Non livraison » ajouté par un autre utilisateur.',
    date: 'hier',
    count: 3,
    risk: 'moderate',
    lastReportRelative: 'hier',
    byCategory: {
      nonLivraison: 1,
      bloqueApresPaiement: 1,
      produitNonConforme: 1,
      usurpation: 0,
    },
  },
  {
    id: '3',
    Icon: Globe,
    contact: 'https://boutique-sus••.ma',
    summary: 'Vigilance : 1 nouveau signalement « Produit non conforme ».',
    date: 'il y a 3 jours',
    count: 1,
    risk: 'vigilance',
    lastReportRelative: 'il y a 3 jours',
    byCategory: {
      nonLivraison: 0,
      bloqueApresPaiement: 0,
      produitNonConforme: 1,
      usurpation: 0,
    },
  },
];

const RISK_BORDER: Record<RiskLevel, string> = {
  low: 'border-l-green-500',
  vigilance: 'border-l-yellow-300',
  moderate: 'border-l-orange-500',
  high: 'border-l-red-500',
};

const RISK_BG: Record<RiskLevel, string> = {
  low: 'bg-green-500',
  vigilance: 'bg-yellow-300',
  moderate: 'bg-orange-500',
  high: 'bg-red-500',
};

const RISK_TEXT: Record<RiskLevel, string> = {
  low: 'text-green-700',
  vigilance: 'text-yellow-700',
  moderate: 'text-orange-700',
  high: 'text-red-700',
};

export function MesAlertesList() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOpen = expanded.size === DEMO_ALERTS.length;
  const toggleAll = () => {
    if (allOpen) setExpanded(new Set());
    else setExpanded(new Set(DEMO_ALERTS.map((a) => a.id)));
  };

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-semibold hover:border-brand-blue hover:bg-gray-50 transition-colors"
        >
          {allOpen ? (
            <>
              <EyeOff className="h-3.5 w-3.5" aria-hidden />
              Tout masquer
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Tout afficher
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {DEMO_ALERTS.map((a) => {
          const isOpen = expanded.has(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-2xl bg-white border border-gray-200 border-l-4 ${RISK_BORDER[a.risk]} shadow-glow-soft hover:shadow-glow-navy transition-shadow overflow-hidden`}
            >
              <div className="p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand-sky flex items-center justify-center shrink-0">
                  <a.Icon className="h-5 w-5 text-brand-navy" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-navy truncate">{a.contact}</p>
                  <p className="mt-1 text-sm text-gray-500">{a.summary}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {a.count} signalements similaires · {a.date}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggle(a.id)}
                    aria-expanded={isOpen}
                    aria-controls={`alert-detail-${a.id}`}
                    className="inline-flex items-center gap-1 rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue hover:bg-gray-50 transition-colors"
                  >
                    {isOpen ? 'Masquer les détails' : 'Voir les détails'}
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy"
                  >
                    <Archive className="h-3 w-3" aria-hidden />
                    Archiver
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden />
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Inline detail (expand/collapse) */}
              <div
                id={`alert-detail-${a.id}`}
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <p className={`text-base font-bold ${RISK_TEXT[a.risk]}`}>
                        {a.count}{' '}
                        {a.count > 1 ? 'signalements enregistrés' : 'signalement enregistré'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Dernier signalement : {a.lastReportRelative}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      <KpiCard
                        icon={PackageX}
                        label="Non livraison"
                        value={a.byCategory.nonLivraison}
                        bg={RISK_BG[a.risk]}
                      />
                      <KpiCard
                        icon={Lock}
                        label="Bloqué après paiement"
                        value={a.byCategory.bloqueApresPaiement}
                        bg={RISK_BG[a.risk]}
                      />
                      <KpiCard
                        icon={PackageCheck}
                        label="Produit non conforme"
                        value={a.byCategory.produitNonConforme}
                        bg={RISK_BG[a.risk]}
                      />
                      <KpiCard
                        icon={UserX}
                        label="Usurpation d'identité"
                        value={a.byCategory.usurpation}
                        bg={RISK_BG[a.risk]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  bg,
}: {
  icon: typeof PackageX;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-2.5 flex flex-col items-start gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-pill ${bg} text-white px-2 py-0.5 text-[10px] font-semibold max-w-full`}
      >
        <Icon className="h-3 w-3 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-xl font-bold text-brand-navy">{value}</span>
    </div>
  );
}
