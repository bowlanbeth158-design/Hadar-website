'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Page admin détail signalement avec actions de modération.
// GET /api/reports/[id] (staff voit même les non-publiés via le guard)
// + POST /api/admin/reports/[id]/moderate (publish/reject/request_correction)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  PencilLine,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApi } from '@/lib/api/hooks';
import { apiCall, ApiClientError } from '@/lib/api/client';

interface ApiReport {
  id: string;
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
  publishedAt: string | null;
  authorId: string | null;
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

export function AdminReportDetailLive({ id }: { id: string }) {
  const router = useRouter();
  const { data, loading, error, refresh } = useApi<ApiReport>(
    `/api/reports/${id}`,
  );
  const [pending, setPending] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const moderate = async (action: 'publish' | 'reject' | 'request_correction') => {
    setActionError(null);
    if (action !== 'publish' && reason.trim().length < 5) {
      setActionError('Motif obligatoire (5 caractères minimum).');
      return;
    }
    setPending(action);
    try {
      await apiCall(`/api/admin/reports/${id}/moderate`, {
        method: 'POST',
        body: { action, reason: reason.trim() || undefined },
      });
      await refresh();
      router.refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError
          ? err.userMessage
          : 'Action impossible.',
      );
    } finally {
      setPending(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error?.userMessage ?? 'Signalement introuvable.'}
      </div>
    );
  }

  const canModerate = data.status === 'SUBMITTED' || data.status === 'UNDER_REVIEW';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              {data.channel} · {data.problemType}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-brand-navy break-all">
              {data.contactValue}
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              ID #{data.id.slice(0, 12)}… · soumis le{' '}
              {new Date(data.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <span
            className={`inline-flex rounded-pill px-3 py-1 text-sm font-semibold ${STATUS_TINT[data.status]}`}
          >
            {STATUS_LABEL[data.status]}
          </span>
        </div>
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-bold text-brand-navy mb-2">
          Description publique
        </h2>
        <p className="text-sm text-gray-700">{data.descriptionPublic}</p>
        {data.amountCents !== null && (
          <p className="mt-3 text-xs text-gray-500">
            Montant : {data.amountCents.toLocaleString('fr-FR')} {data.currency}
          </p>
        )}
      </section>

      {data.adminNotes && (
        <section className="rounded-2xl bg-yellow-50 border border-yellow-200 p-6">
          <h2 className="text-sm font-bold text-yellow-900 mb-2">
            🔒 Notes admin (non publiques)
          </h2>
          <p className="text-sm text-yellow-900 whitespace-pre-wrap">
            {data.adminNotes}
          </p>
        </section>
      )}

      {data.moderationReason && (
        <section className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-brand-navy mb-2">
            Motif de modération
          </h2>
          <p className="text-sm text-gray-700">{data.moderationReason}</p>
        </section>
      )}

      {canModerate && (
        <section className="rounded-2xl bg-white border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-brand-navy mb-3">Décision</h2>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif (obligatoire pour Rejeter / À corriger)…"
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-blue"
          />
          {actionError && (
            <div className="mt-2 inline-flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
              {actionError}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!!pending}
              onClick={() => moderate('publish')}
              className="inline-flex items-center gap-2 rounded-pill bg-green-600 text-white px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {pending === 'publish' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Publier
            </button>
            <button
              type="button"
              disabled={!!pending}
              onClick={() => moderate('reject')}
              className="inline-flex items-center gap-2 rounded-pill bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {pending === 'reject' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Non retenu
            </button>
            <button
              type="button"
              disabled={!!pending}
              onClick={() => moderate('request_correction')}
              className="inline-flex items-center gap-2 rounded-pill bg-orange-500 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {pending === 'request_correction' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PencilLine className="h-4 w-4" />
              )}
              À corriger
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
