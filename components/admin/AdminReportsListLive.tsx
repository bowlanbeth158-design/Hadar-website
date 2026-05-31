'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Liste live des signalements — file de modération.
// GET /api/admin/reports — filtrable par period date / status / q (search).
// Permission requise : MODERATOR+ (validée côté serveur par requireMember).
//
// UI :
//   - Pills de période (Aujourd'hui / Hier / 7j / 30j / 365j / Personnalisé)
//   - 4 KPI cards (En cours, Publié, Non retenu, À corriger) — count + %
//   - Pills de statut (Tous + 4 buckets)
//   - Barre de recherche (ID prefix, problemType)
//   - Table : ID, Contact (+ canal), Type problème, Montant, Date, Statut
//   - Pagination
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Loader2, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { useApi } from '@/lib/api/hooks';

type Status =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_CORRECTION'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

interface ReportRow {
  id: string;
  userId: string;
  channel: string;
  contactValue: string;
  problemType: string;
  amountCents: number | null;
  currency: string;
  status: Status;
  createdAt: string;
}

interface ReportsResponse {
  items: ReportRow[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
  counts: Record<Status, number>;
  countsTotal: number;
}

// ── Period filter ───────────────────────────────────────────────────────────

type PeriodKey = 'today' | 'yesterday' | '7d' | '30d' | '365d' | 'custom';

const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'yesterday', label: 'Hier' },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: '365d', label: '365 jours' },
  { key: 'custom', label: 'Personnalisé' },
];

function periodRange(p: PeriodKey, customFrom?: string, customTo?: string): {
  from?: string;
  to?: string;
} {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);

  switch (p) {
    case 'today':
      return { from: startOfToday.toISOString(), to: endOfToday.toISOString() };
    case 'yesterday': {
      const start = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const end = new Date(startOfToday.getTime() - 1);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    case '7d':
      return {
        from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: endOfToday.toISOString(),
      };
    case '30d':
      return {
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: endOfToday.toISOString(),
      };
    case '365d':
      return {
        from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        to: endOfToday.toISOString(),
      };
    case 'custom':
      return {
        from: customFrom ? new Date(customFrom).toISOString() : undefined,
        to: customTo ? new Date(customTo + 'T23:59:59').toISOString() : undefined,
      };
  }
}

// ── Status bucket (regroupe SUBMITTED + UNDER_REVIEW = "En cours") ──────────

type Bucket = 'all' | 'pending' | 'published' | 'rejected' | 'needsCorrection';

const BUCKETS: Array<{ key: Bucket; label: string; statuses: Status[] }> = [
  { key: 'all', label: 'Tous', statuses: [] },
  { key: 'pending', label: 'En cours', statuses: ['SUBMITTED', 'UNDER_REVIEW'] },
  { key: 'published', label: 'Publié', statuses: ['PUBLISHED'] },
  { key: 'rejected', label: 'Non retenu', statuses: ['REJECTED'] },
  { key: 'needsCorrection', label: 'À corriger', statuses: ['NEEDS_CORRECTION'] },
];

function countBucket(counts: Record<Status, number>, b: Bucket): number {
  switch (b) {
    case 'pending':
      return counts.SUBMITTED + counts.UNDER_REVIEW;
    case 'published':
      return counts.PUBLISHED;
    case 'rejected':
      return counts.REJECTED;
    case 'needsCorrection':
      return counts.NEEDS_CORRECTION;
    case 'all':
      return (
        counts.SUBMITTED +
        counts.UNDER_REVIEW +
        counts.PUBLISHED +
        counts.REJECTED +
        counts.NEEDS_CORRECTION
      );
  }
}

// ── Display helpers ─────────────────────────────────────────────────────────

const STATUS_LABEL: Record<Status, string> = {
  SUBMITTED: 'En cours',
  UNDER_REVIEW: 'En cours',
  PUBLISHED: 'Publié',
  REJECTED: 'Non retenu',
  NEEDS_CORRECTION: 'À corriger',
  ARCHIVED: 'Archivé',
};

const STATUS_TINT: Record<Status, string> = {
  SUBMITTED: 'bg-orange-100 text-orange-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  NEEDS_CORRECTION: 'bg-yellow-100 text-yellow-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

const CHANNEL_LABEL: Record<string, string> = {
  TELEPHONE: 'Téléphone',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  SITE_WEB: 'Site web',
  RESEAUX_SOCIAUX: 'Réseaux sociaux',
  PAYPAL: 'PayPal',
  BINANCE: 'Binance',
  RIB: 'RIB',
  CIN: 'CIN',
};

const KPI_CARDS: Array<{ bucket: Exclude<Bucket, 'all'>; tint: string }> = [
  { bucket: 'pending', tint: 'bg-orange-50 border-orange-200 text-orange-700' },
  { bucket: 'published', tint: 'bg-green-50 border-green-200 text-green-700' },
  { bucket: 'rejected', tint: 'bg-red-50 border-red-200 text-red-700' },
  { bucket: 'needsCorrection', tint: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
];

function formatAmount(cents: number | null, currency: string): string {
  if (cents === null) return '—';
  const value = (cents / 100).toLocaleString('fr-FR', {
    maximumFractionDigits: 0,
  });
  return `${value} ${currency}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
  const time = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return `${date} ${time}`;
}

// ── Component ───────────────────────────────────────────────────────────────

export function AdminReportsListLive() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [bucket, setBucket] = useState<Bucket>('all');
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Debounce search input — n'envoie la requête qu'après 300ms d'inactivité
  // pour éviter de spammer l'API à chaque frappe.
  useMemo(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const range = periodRange(period, customFrom, customTo);
  const statuses = BUCKETS.find((b) => b.key === bucket)?.statuses ?? [];

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (statuses.length > 0) params.set('status', statuses.join(','));
  if (range.from) params.set('from', range.from);
  if (range.to) params.set('to', range.to);
  if (qDebounced) params.set('q', qDebounced);

  const path = `/api/admin/reports?${params.toString()}`;
  const { data, loading, error, refresh } = useApi<ReportsResponse>(path, [
    path,
  ]);

  const counts = data?.counts ?? {
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    NEEDS_CORRECTION: 0,
    PUBLISHED: 0,
    REJECTED: 0,
    ARCHIVED: 0,
  };
  const totalForPct = data?.countsTotal ?? 0;

  // Reset page à 1 quand on change un filtre (sinon on peut se retrouver
  // sur page 5 d'un set qui n'en a plus que 2).
  function resetAndSet<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  return (
    <div className="space-y-5">
      {/* ── Pills de période ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {PERIODS.map((p) => {
          const active = period === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={resetAndSet(setPeriod)(p.key)}
              className={
                active
                  ? 'inline-flex rounded-pill bg-brand-navy text-white px-3 py-1.5 text-sm font-semibold shadow-glow-soft'
                  : 'inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1.5 text-sm font-medium hover:border-brand-blue'
              }
            >
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={refresh}
          className="ml-auto inline-flex items-center gap-1 rounded-pill border border-gray-200 px-3 py-1.5 text-xs text-brand-blue hover:bg-brand-sky/30"
          aria-label="Rafraîchir"
          title="Rafraîchir"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Rafraîchir
        </button>
      </div>

      {/* Custom range inputs — visibles uniquement quand period === 'custom' */}
      {period === 'custom' && (
        <div className="flex items-center gap-3 flex-wrap rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm">
          <label className="inline-flex items-center gap-2 text-brand-navy">
            Du
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-brand-navy">
            Au
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                setPage(1);
              }}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
          </label>
        </div>
      )}

      {/* ── 4 KPI cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_CARDS.map((c) => {
          const value = countBucket(counts, c.bucket);
          const pct = totalForPct > 0 ? Math.round((value / totalForPct) * 100) : 0;
          const label = BUCKETS.find((b) => b.key === c.bucket)?.label ?? '';
          return (
            <article
              key={c.bucket}
              className={`rounded-2xl border ${c.tint} px-4 py-3`}
            >
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                {label}
              </p>
              <p className="text-xs opacity-70 tabular-nums mt-0.5">{pct}%</p>
            </article>
          );
        })}
      </div>

      {/* ── Pills de statut + recherche ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {BUCKETS.map((b) => {
          const active = bucket === b.key;
          return (
            <button
              key={b.key}
              type="button"
              onClick={resetAndSet(setBucket)(b.key)}
              className={
                active
                  ? 'inline-flex rounded-pill bg-brand-navy text-white px-3 py-1.5 text-sm font-semibold shadow-glow-soft'
                  : 'inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1.5 text-sm font-medium hover:border-brand-blue'
              }
            >
              {b.label}
            </button>
          );
        })}
        <div className="ml-auto relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher (ID, problème, contact)…"
            className="rounded-pill border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      {/* ── Loading / error / empty / table ─────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
          <p className="mt-2 text-xs text-gray-400">Chargement…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 inline-flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="font-semibold">{error.userMessage}</p>
            {error.code === 'FORBIDDEN' && (
              <p className="text-xs">Tu n&apos;as pas la permission MODERATOR+.</p>
            )}
          </div>
        </div>
      )}

      {data && data.items.length === 0 && !loading && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
          Aucun signalement dans ce filtre.
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Type problème</th>
                  <th className="px-4 py-3 text-left">Montant</th>
                  <th className="px-4 py-3 text-left">Date &amp; heure</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">—</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50/60"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      #{r.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-brand-navy">
                      <span className="font-medium">
                        {CHANNEL_LABEL[r.channel] ?? r.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-navy">{r.problemType}</td>
                    <td className="px-4 py-3 text-brand-navy tabular-nums">
                      {formatAmount(r.amountCents, r.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 tabular-nums">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_TINT[r.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/signalements/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                      >
                        <Eye className="h-3 w-3" aria-hidden />
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>
              {data.pagination.total} signalement
              {data.pagination.total > 1 ? 's' : ''}
            </p>
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-pill border border-gray-200 px-3 py-1 text-sm text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-blue"
                aria-label="Page précédente"
              >
                ‹
              </button>
              <span className="px-2 tabular-nums">
                Page {data.pagination.page}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.hasMore}
                className="rounded-pill border border-gray-200 px-3 py-1 text-sm text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-blue"
                aria-label="Page suivante"
              >
                ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
