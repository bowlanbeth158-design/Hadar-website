'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Clock,
  Copy,
  XCircle,
  PencilLine,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { PeriodTabs } from '@/components/admin/PeriodTabs';
import { RefreshButton } from '@/components/admin/RefreshButton';
import { ExportButton } from '@/components/admin/ExportButton';
import { REPORTS, STATUS_LABEL, type Status } from '@/lib/mock/signalements';

const STATUS_CONFIG: Record<
  Status,
  { label: string; pill: string; text: string; Icon: LucideIcon; gradient: string; glow: string }
> = {
  en_cours: { label: 'En cours', pill: 'bg-orange-100', text: 'text-orange-700', Icon: Clock, gradient: 'bg-grad-stat-orange', glow: 'shadow-glow-orange' },
  publie: { label: 'Publié', pill: 'bg-green-100', text: 'text-green-700', Icon: Copy, gradient: 'bg-grad-stat-green', glow: 'shadow-glow-green' },
  non_retenu: { label: 'Non retenu', pill: 'bg-red-100', text: 'text-red-700', Icon: XCircle, gradient: 'bg-grad-stat-red', glow: 'shadow-glow-red' },
  a_corriger: { label: 'À corriger', pill: 'bg-brand-sky', text: 'text-brand-navy', Icon: PencilLine, gradient: 'bg-grad-stat-navy', glow: 'shadow-glow-navy' },
};

const STATUS_ORDER: Status[] = ['en_cours', 'publie', 'non_retenu', 'a_corriger'];
const FILTERS: { id: 'all' | Status; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'en_cours', label: STATUS_LABEL.en_cours },
  { id: 'publie', label: STATUS_LABEL.publie },
  { id: 'non_retenu', label: STATUS_LABEL.non_retenu },
  { id: 'a_corriger', label: STATUS_LABEL.a_corriger },
];

const PAGE_SIZE = 5;
const DECISIONS_KEY = 'hadar:moderation-decisions';
// Dataset snapshot "today" — matches the latest date in lib/mock/signalements
const TODAY_ISO = '2026-04-13';

type DecisionStore = Record<string, Status>;

function readDecisions(): DecisionStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(DECISIONS_KEY);
    return raw ? (JSON.parse(raw) as DecisionStore) : {};
  } catch {
    return {};
  }
}

function parseFrDate(d: string): Date | null {
  // "13/04/26  23:12:05" → Date
  const [datePart] = d.trim().split(/\s+/);
  if (!datePart) return null;
  const [dd, mm, yy] = datePart.split('/');
  if (!dd || !mm || !yy) return null;
  const year = yy.length === 2 ? 2000 + Number(yy) : Number(yy);
  return new Date(year, Number(mm) - 1, Number(dd));
}

function inPeriod(
  d: string,
  periodIndex: number,
  range?: { from: string; to: string },
): boolean {
  const date = parseFrDate(d);
  if (!date) return true;
  const today = new Date(TODAY_ISO);
  const diffDays = Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  if (periodIndex === 0) return diffDays === 0; // Aujourd'hui
  if (periodIndex === 1) return diffDays === 1; // Hier
  if (periodIndex === 2) return diffDays >= 0 && diffDays < 7; // 7 jours
  if (periodIndex === 3) return diffDays >= 0 && diffDays < 30; // 30 jours
  if (periodIndex === 4) return diffDays >= 0 && diffDays < 365; // 365 jours
  if (periodIndex === 5 && range?.from && range?.to) {
    const from = new Date(range.from);
    const to = new Date(range.to);
    return date.getTime() >= from.getTime() && date.getTime() <= to.getTime() + 86_400_000 - 1;
  }
  return true;
}

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [decisions, setDecisions] = useState<DecisionStore>({});
  const [periodIndex, setPeriodIndex] = useState(4);
  const [periodLabel, setPeriodLabel] = useState('365 jours');
  const [periodRange, setPeriodRange] = useState<{ from: string; to: string } | undefined>();

  useEffect(() => {
    setDecisions(readDecisions());
    const onStorage = (e: StorageEvent) => {
      if (e.key === DECISIONS_KEY) setDecisions(readDecisions());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshKey]);

  const merged = useMemo(
    () =>
      REPORTS.map((r) => ({
        ...r,
        status: (decisions[r.id] ?? r.status) as Status,
      })),
    [decisions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merged.filter((r) => {
      if (!inPeriod(r.date, periodIndex, periodRange)) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.id.includes(q) ||
        r.problem.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q) ||
        r.contactMasked.toLowerCase().includes(q)
      );
    });
  }, [merged, statusFilter, query, periodIndex, periodRange]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query, periodIndex, periodRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const counts = useMemo(() => {
    const base: Record<Status, number> = { en_cours: 0, publie: 0, non_retenu: 0, a_corriger: 0 };
    for (const r of filtered) base[r.status] += 1;
    return base;
  }, [filtered]);

  const total = filtered.length || 1;

  const exportRows = (): (string | number)[][] => [
    ['ID', 'Contact', 'Type problème', 'Montant', 'Date & heure', 'Statut'],
    ...filtered.map((r) => [
      `#${r.id}`,
      r.contact,
      r.problem,
      r.amount,
      r.date,
      STATUS_CONFIG[r.status].label,
    ]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Signalements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Période : <span className="font-semibold text-brand-navy">{periodLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
          <ExportButton filename="hadar-signalements" getRows={exportRows} />
        </div>
      </div>

      <div className="mb-8">
        <PeriodTabs
          defaultActive={4}
          onChange={(label, index, range) => {
            setPeriodLabel(label);
            setPeriodIndex(index);
            setPeriodRange(range);
          }}
        />
      </div>

      <nav role="tablist" className="flex flex-wrap justify-center gap-2 mb-8">
        {FILTERS.map((f) => {
          const active = statusFilter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={
                active
                  ? 'rounded-pill bg-brand-navy text-white px-5 py-2 text-sm font-semibold shadow-glow-navy hover:scale-[1.03] transition-transform'
                  : 'rounded-pill border border-brand-navy text-brand-navy px-5 py-2 text-sm font-medium hover:bg-brand-navy hover:text-white hover:shadow-glow-navy hover:scale-[1.03] transition-all'
              }
            >
              {f.label}
            </button>
          );
        })}
      </nav>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {STATUS_ORDER.map((s) => {
          const c = STATUS_CONFIG[s];
          const count = counts[s];
          const pct = Math.round((count / total) * 100);
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter((prev) => (prev === s ? 'all' : s))}
              aria-pressed={statusFilter === s}
              className={`${c.gradient} ${c.glow} text-white rounded-2xl overflow-hidden text-left transition-transform hover:scale-[1.02] ${
                statusFilter === s ? 'ring-4 ring-white/40' : ''
              }`}
            >
              <div className="h-1 bg-white/30">
                <div className="h-full bg-white transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">
                    <AnimatedCounter key={`${refreshKey}-${s}-${count}`} value={`${count}`} />
                  </p>
                  <p className="mt-1 text-sm font-medium opacity-90">{c.label}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <c.Icon className="h-7 w-7 opacity-80" aria-hidden />
                  <span className="text-xs font-semibold opacity-90">
                    <AnimatedCounter key={`${refreshKey}-pct-${s}-${pct}`} value={`${pct}%`} />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end mb-4">
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (ID, problème, contact)…"
            className="w-full rounded-pill bg-white border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th scope="col" className="text-left px-5 py-3 font-semibold">ID</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Contact</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Type problème</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Montant</th>
                <th scope="col" className="text-left px-5 py-3 font-semibold">Date & heure</th>
                <th scope="col" className="text-right px-5 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    Aucun signalement ne correspond à vos critères.
                  </td>
                </tr>
              )}
              {pageItems.map((r) => {
                const c = STATUS_CONFIG[r.status];
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-brand-sky/20 cursor-pointer transition-colors"
                    onClick={() => {
                      window.location.href = `/admin/signalements/${r.id}`;
                    }}
                  >
                    <td className="px-5 py-3 font-semibold text-brand-navy">
                      <Link
                        href={`/admin/signalements/${r.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-brand-blue"
                      >
                        #{r.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-brand-navy">{r.contact}</td>
                    <td className="px-5 py-3 text-gray-600">{r.problem}</td>
                    <td className="px-5 py-3 text-gray-600">{r.amount}</td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/signalements/${r.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`inline-flex items-center gap-1.5 rounded-pill ${c.pill} ${c.text} px-3 py-1 text-xs font-semibold hover:opacity-80 transition-opacity`}
                      >
                        {c.label}
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          <span>
            {filtered.length} signalement{filtered.length > 1 ? 's' : ''}
            {statusFilter === 'all' ? '' : ` · filtre : ${STATUS_LABEL[statusFilter]}`}
            {query ? ` · recherche : « ${query} »` : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Page précédente"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={
                  p === currentPage
                    ? 'px-2.5 py-1 rounded bg-brand-navy text-white font-semibold shadow-glow-navy'
                    : 'px-2.5 py-1 rounded hover:bg-gray-100 text-brand-navy'
                }
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
