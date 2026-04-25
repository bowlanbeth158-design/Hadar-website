'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Layers,
  Clock4,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronsDown,
} from 'lucide-react';
import {
  REPORT_CHANNEL_ICON,
  REPORT_CHANNEL_LABEL,
  STATUS_BADGE,
  STATUS_BORDER,
  STATUS_LABEL,
  USER_REPORTS,
  type Report,
  type ReportStatus,
} from '@/lib/mock/user-reports';

type FilterKey = 'all' | ReportStatus;

const FILTERS: { key: FilterKey; label: string; Icon: typeof Layers }[] = [
  { key: 'all', label: 'Tous', Icon: Layers },
  { key: 'en_attente', label: 'En attente', Icon: Clock4 },
  { key: 'publie', label: 'Publiés', Icon: CheckCircle2 },
  { key: 'a_corriger', label: 'À corriger', Icon: AlertCircle },
  { key: 'refuse', label: 'Refusés', Icon: XCircle },
];

// Initial cap before the user clicks "Voir plus de signalements".
const INITIAL_VISIBLE = 4;

const CONFIDENTIALITY_TITLE = 'Vos signalements sont traités de manière confidentielle';
const CONFIDENTIALITY_BODY = 'Seuls vous et nos équipes ont accès à vos signalements.';

export function MesSignalementsList({ reports = USER_REPORTS }: { reports?: Report[] }) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showAll, setShowAll] = useState(false);

  const counts = useMemo(
    () => ({
      all: reports.length,
      en_attente: reports.filter((r) => r.status === 'en_attente').length,
      publie: reports.filter((r) => r.status === 'publie').length,
      a_corriger: reports.filter((r) => r.status === 'a_corriger').length,
      refuse: reports.filter((r) => r.status === 'refuse').length,
    }),
    [reports]
  );

  const visible = useMemo(
    () => (filter === 'all' ? reports : reports.filter((r) => r.status === filter)),
    [reports, filter]
  );

  const displayed = showAll ? visible : visible.slice(0, INITIAL_VISIBLE);
  const hiddenCount = visible.length - displayed.length;

  // Reset the "show all" toggle when the user switches filter so the list
  // stays predictable.
  useEffect(() => {
    setShowAll(false);
  }, [filter]);

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
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
              {f.label}
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

      {/* Empty state */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-brand-sky/40 flex items-center justify-center">
            <Layers className="h-7 w-7 text-brand-blue/60" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-brand-navy mb-1">
            Aucun signalement dans cette catégorie
          </p>
          <p className="text-xs text-gray-500 max-w-[300px] mx-auto">
            Changez de filtre ou soumettez un nouveau signalement.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((r) => {
            const Icon = REPORT_CHANNEL_ICON[r.channel];
            return (
              <div
                key={r.id}
                className={`rounded-2xl bg-white border border-gray-200 border-l-4 ${STATUS_BORDER[r.status]} p-5 shadow-glow-soft hover:shadow-glow-navy transition-all`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[r.status]}`}
                      >
                        {STATUS_LABEL[r.status]}
                      </span>
                      <span className="text-xs font-medium text-brand-navy rounded-pill bg-brand-sky/60 px-2.5 py-0.5">
                        {r.problem}
                      </span>
                      <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                        <Icon className="h-3 w-3" aria-hidden />
                        {REPORT_CHANNEL_LABEL[r.channel]}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-brand-navy">{r.contact}</p>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{r.description}</p>
                    <p className="mt-2 text-xs text-gray-400">Soumis {r.date}</p>
                  </div>
                  <Link
                    href={`/mes-signalements/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-brand-navy text-brand-navy px-4 py-1.5 text-sm font-semibold hover:bg-brand-navy hover:text-white shadow-glow-soft hover:shadow-glow-navy transition-all"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                    Voir les détails
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "Voir plus de signalements" — only shown if some reports of the
          current filter are hidden behind the initial cap. */}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          aria-label={`Voir ${hiddenCount} signalement${hiddenCount > 1 ? 's' : ''} de plus`}
          className="group mt-6 mx-auto flex flex-col items-center gap-1 text-gray-400 hover:text-brand-blue transition-colors"
        >
          <ChevronsDown
            className="h-7 w-7 transition-transform duration-300 ease-out group-hover:translate-y-0.5 animate-pulse"
            aria-hidden
          />
          <span className="text-xs font-medium">
            Voir {hiddenCount} signalement{hiddenCount > 1 ? 's' : ''} de plus
          </span>
        </button>
      )}

      {/* Confidentiality footer — required for the user-side, two lines */}
      <div className="mt-10 text-center">
        <p className="text-sm font-semibold text-brand-navy">{CONFIDENTIALITY_TITLE}</p>
        <p className="mt-1 text-xs text-gray-400 max-w-xl mx-auto">{CONFIDENTIALITY_BODY}</p>
      </div>
    </>
  );
}
