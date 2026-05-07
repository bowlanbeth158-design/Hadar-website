'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Liste live des signalements pour la file de modération.
// GET /api/admin/reports — filtrable par status. Permission requise :
// MODERATOR+ (validée côté serveur par requireMember).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Loader2, AlertTriangle } from 'lucide-react';
import { useApi } from '@/lib/api/hooks';

interface ReportRow {
  id: string;
  userId: string;
  channel: string;
  contactValue: string;
  problemType: string;
  amountCents: number | null;
  currency: string;
  descriptionPublic: string;
  adminNotes: string | null;
  status: string;
  moderationReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
  evidencesCount: number;
}

interface ReportsResponse {
  items: ReportRow[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
}

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'En cours',
  UNDER_REVIEW: 'En examen',
  PUBLISHED: 'Publié',
  REJECTED: 'Non retenu',
  NEEDS_CORRECTION: 'À corriger',
  ARCHIVED: 'Archivé',
};

const STATUS_TINT: Record<string, string> = {
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  NEEDS_CORRECTION: 'bg-orange-100 text-orange-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

const FILTERS: Array<{ key: string | null; label: string }> = [
  { key: null, label: 'Tous' },
  { key: 'SUBMITTED', label: 'En cours' },
  { key: 'UNDER_REVIEW', label: 'En examen' },
  { key: 'PUBLISHED', label: 'Publiés' },
  { key: 'REJECTED', label: 'Non retenus' },
  { key: 'NEEDS_CORRECTION', label: 'À corriger' },
];

export function AdminReportsListLive() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const path = statusFilter
    ? `/api/admin/reports?status=${statusFilter}&pageSize=50`
    : `/api/admin/reports?pageSize=50`;
  const { data, loading, error, refresh } = useApi<ReportsResponse>(path, [
    statusFilter,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const active = statusFilter === f.key;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={
                active
                  ? 'inline-flex rounded-pill bg-brand-navy text-white px-3 py-1.5 text-sm font-semibold shadow-glow-soft'
                  : 'inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1.5 text-sm font-medium hover:border-brand-blue'
              }
            >
              {f.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={refresh}
          className="ml-auto text-xs text-brand-blue hover:underline"
        >
          Rafraîchir
        </button>
      </div>

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

      {data && data.items.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
          Aucun signalement dans ce filtre.
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Canal</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">—</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {r.id.slice(0, 10)}…
                  </td>
                  <td className="px-4 py-3 text-brand-navy">{r.channel}</td>
                  <td className="px-4 py-3 font-medium text-brand-navy break-all">
                    {r.contactValue}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_TINT[r.status] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString('fr-FR')}
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
          <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
            {data.pagination.total} signalement{data.pagination.total > 1 ? 's' : ''}{' '}
            au total
          </div>
        </div>
      )}
    </div>
  );
}
