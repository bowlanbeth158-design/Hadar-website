'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Trash2,
  Archive,
  ChevronDown,
  ChevronsDown,
  PackageX,
  Lock,
  PackageCheck,
  UserX,
  Inbox,
  Layers,
} from 'lucide-react';
import {
  CHANNEL_ICON,
  DEMO_ALERTS,
  type Alert,
  type AlertStatus,
  type RiskLevel,
} from '@/lib/mock/alerts';
import { useI18n } from '@/lib/i18n/provider';

type FilterKey = 'all' | AlertStatus;

const RISK_BORDER: Record<RiskLevel, string> = {
  low: 'border-l-green-500',
  vigilance: 'border-l-yellow-300',
  moderate: 'border-l-orange-500',
  high: 'border-l-red-500',
};

// Brand gradient tokens (defined in tailwind.config.ts → backgroundImage)
const RISK_GRADIENT: Record<RiskLevel, string> = {
  low: 'bg-grad-alert-green',
  vigilance: 'bg-grad-alert-yellow',
  moderate: 'bg-grad-alert-orange',
  high: 'bg-grad-alert-red',
};

// Soft tinted gradient for the expanded panel background
const RISK_PANEL_TINT: Record<RiskLevel, string> = {
  low: 'bg-gradient-to-br from-green-100/50 via-white to-green-100/20',
  vigilance: 'bg-gradient-to-br from-yellow-100/60 via-white to-yellow-100/20',
  moderate: 'bg-gradient-to-br from-orange-100/50 via-white to-orange-100/20',
  high: 'bg-gradient-to-br from-red-100/50 via-white to-red-100/20',
};

// Colored halo on hover, matching the risk level
const RISK_GLOW: Record<RiskLevel, string> = {
  low: 'hover:shadow-glow-green',
  vigilance: 'hover:shadow-glow-yellow',
  moderate: 'hover:shadow-glow-orange',
  high: 'hover:shadow-glow-red',
};

const FILTERS: { key: FilterKey; labelKey: string; Icon: typeof Layers }[] = [
  { key: 'all',      labelKey: 'mesAlertes.filter.all',      Icon: Layers },
  { key: 'active',   labelKey: 'mesAlertes.filter.active',   Icon: Inbox  },
  { key: 'archived', labelKey: 'mesAlertes.filter.archived', Icon: Archive },
  { key: 'deleted',  labelKey: 'mesAlertes.filter.deleted',  Icon: Trash2 },
];

// Initial cap before the user clicks "Voir plus d'alertes". Tuned so the page
// stays scannable even if the user follows many contacts.
const INITIAL_VISIBLE = 4;

export function MesAlertesList({ initialExpandId }: { initialExpandId?: string | null }) {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState<Alert[]>(DEMO_ALERTS);
  const [filter, setFilter] = useState<FilterKey>('active');
  const [expanded, setExpanded] = useState<Set<string>>(
    initialExpandId ? new Set([initialExpandId]) : new Set()
  );
  const [showAll, setShowAll] = useState(false);
  const scrolledRef = useRef(false);

  // When a deep link like /mes-alertes?alert=2 is opened, scroll the
  // chosen alert into view and ensure it's visible (use the 'all' filter
  // if the chosen alert isn't active, so the user always sees it).
  useEffect(() => {
    if (!initialExpandId || scrolledRef.current) return;
    const target = alerts.find((a) => a.id === initialExpandId);
    if (target && target.status !== 'active') setFilter('all');
    const el = document.getElementById(`alert-card-${initialExpandId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      scrolledRef.current = true;
    }
  }, [initialExpandId, alerts]);

  const counts = useMemo(
    () => ({
      all: alerts.length,
      active: alerts.filter((a) => a.status === 'active').length,
      archived: alerts.filter((a) => a.status === 'archived').length,
      deleted: alerts.filter((a) => a.status === 'deleted').length,
    }),
    [alerts]
  );

  const visible = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((a) => a.status === filter)),
    [alerts, filter]
  );

  const displayed = showAll ? visible : visible.slice(0, INITIAL_VISIBLE);
  const hiddenCount = visible.length - displayed.length;

  // Reset the "show all" toggle when the user switches filter so the list
  // stays predictable.
  useEffect(() => {
    setShowAll(false);
  }, [filter]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setStatus = (id: string, status: AlertStatus) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  return (
    <>
      {/* Filter pills — Tous / Actives / Archivées / Supprimées */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const n = counts[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${
                active
                  ? 'bg-brand-navy text-white shadow-glow-soft'
                  : 'bg-white border border-gray-200 text-brand-navy hover:border-brand-blue hover:bg-gray-50'
              }`}
            >
              <f.Icon className="h-3.5 w-3.5" aria-hidden />
              {t(f.labelKey)}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-brand-sky text-brand-navy'
                }`}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state per filter */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-brand-sky/40 flex items-center justify-center">
            <Inbox className="h-7 w-7 text-brand-blue/60" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-brand-navy mb-1">
            {filter === 'archived' && t('mesAlertes.empty.archived')}
            {filter === 'deleted' && t('mesAlertes.empty.deleted')}
            {filter === 'active' && t('mesAlertes.empty.active')}
            {filter === 'all' && t('mesAlertes.empty.all')}
          </p>
          <p className="text-xs text-gray-500 max-w-[300px] mx-auto">
            {filter === 'active'
              ? t('mesAlertes.empty.activeHint')
              : t('mesAlertes.empty.otherHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((a) => {
            const isOpen = expanded.has(a.id);
            const Icon = CHANNEL_ICON[a.channel];
            return (
              <div
                key={a.id}
                id={`alert-card-${a.id}`}
                className={`rounded-2xl bg-white border border-gray-200 border-l-4 ${RISK_BORDER[a.risk]} shadow-glow-soft hover:shadow-glow-navy transition-shadow overflow-hidden`}
              >
                <div className="p-4 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-brand-sky flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-brand-navy" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-navy truncate">{a.contact}</p>
                    <p className="mt-1 text-sm text-gray-500">{a.summary}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {t('mesAlertes.similar.label', { n: a.count, date: a.date })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(a.id)}
                      aria-expanded={isOpen}
                      aria-controls={`alert-detail-${a.id}`}
                      className="inline-flex items-center gap-1 rounded-pill border border-gray-200 text-brand-navy px-3 py-1 text-xs font-medium hover:border-brand-blue hover:bg-gray-50 transition-colors"
                    >
                      {isOpen ? t('mesAlertes.action.toggleClose') : t('mesAlertes.action.toggleOpen')}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    {a.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, 'archived')}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy transition-colors"
                      >
                        <Archive className="h-3 w-3" aria-hidden />
                        {t('mesAlertes.action.archive')}
                      </button>
                    )}
                    {a.status === 'archived' && (
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, 'active')}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy transition-colors"
                      >
                        <Inbox className="h-3 w-3" aria-hidden />
                        {t('mesAlertes.action.restore')}
                      </button>
                    )}
                    {a.status !== 'deleted' && (
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, 'deleted')}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                        {t('mesAlertes.action.delete')}
                      </button>
                    )}
                    {a.status === 'deleted' && (
                      <button
                        type="button"
                        onClick={() => setStatus(a.id, 'active')}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-navy transition-colors"
                      >
                        <Inbox className="h-3 w-3" aria-hidden />
                        {t('mesAlertes.action.restore')}
                      </button>
                    )}
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
                    <div
                      className={`border-t border-gray-100 px-5 py-5 ${RISK_PANEL_TINT[a.risk]}`}
                    >
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <p
                          className={`text-lg font-extrabold tracking-tight bg-clip-text text-transparent ${RISK_GRADIENT[a.risk]}`}
                        >
                          {t(
                            a.count > 1
                              ? 'mesAlertes.detail.reports.plural'
                              : 'mesAlertes.detail.reports.singular',
                            { n: a.count },
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('mesAlertes.detail.lastReport', { time: a.lastReportRelative })}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <KpiCard
                          icon={PackageX}
                          label={t('mesAlertes.kpi.nonDelivery')}
                          value={a.byCategory.nonLivraison}
                          gradient={RISK_GRADIENT[a.risk]}
                          glow={RISK_GLOW[a.risk]}
                        />
                        <KpiCard
                          icon={Lock}
                          label={t('mesAlertes.kpi.blockedAfterPayment')}
                          value={a.byCategory.bloqueApresPaiement}
                          gradient={RISK_GRADIENT[a.risk]}
                          glow={RISK_GLOW[a.risk]}
                        />
                        <KpiCard
                          icon={PackageCheck}
                          label={t('mesAlertes.kpi.nonCompliant')}
                          value={a.byCategory.produitNonConforme}
                          gradient={RISK_GRADIENT[a.risk]}
                          glow={RISK_GLOW[a.risk]}
                        />
                        <KpiCard
                          icon={UserX}
                          label={t('mesAlertes.kpi.identityTheft')}
                          value={a.byCategory.usurpation}
                          gradient={RISK_GRADIENT[a.risk]}
                          glow={RISK_GLOW[a.risk]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "Voir plus d'alertes" — only shown if some alerts of the current
          filter are hidden behind the initial cap. */}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          aria-label={t(
            hiddenCount > 1 ? 'mesAlertes.viewMore.plural' : 'mesAlertes.viewMore.singular',
            { n: hiddenCount },
          )}
          className="group mt-6 mx-auto flex flex-col items-center gap-1 text-gray-400 hover:text-brand-blue transition-colors"
        >
          <ChevronsDown
            className="h-7 w-7 transition-transform duration-300 ease-out group-hover:translate-y-0.5 animate-pulse"
            aria-hidden
          />
          <span className="text-xs font-medium">
            {t(
              hiddenCount > 1 ? 'mesAlertes.viewMore.plural' : 'mesAlertes.viewMore.singular',
              { n: hiddenCount },
            )}
          </span>
        </button>
      )}

      {/* Legal disclaimer — required for the Moroccan jurisdiction. */}
      <p className="mt-10 text-center text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
        {t('mesAlertes.disclaimer')}
      </p>
    </>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  gradient,
  glow,
}: {
  icon: typeof PackageX;
  label: string;
  value: number;
  gradient: string;
  glow: string;
}) {
  return (
    <div
      className={`group rounded-xl bg-white border border-gray-200 p-2.5 flex flex-col items-start gap-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:border-transparent ${glow}`}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-pill ${gradient} text-white px-2 py-0.5 text-[10px] font-semibold max-w-full shadow-sm group-hover:shadow-md transition-shadow`}
      >
        <Icon className="h-3 w-3 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
      <span className={`text-xl font-bold bg-clip-text text-transparent ${gradient}`}>
        {value}
      </span>
    </div>
  );
}
