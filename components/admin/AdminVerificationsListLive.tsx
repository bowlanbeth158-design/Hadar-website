'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Admin — file de vérifications d'identité (CIN+selfie) à examiner.
// GET /api/admin/verifications + POST .../approve|reject
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useApi } from '@/lib/api/hooks';
import { apiCall, ApiClientError } from '@/lib/api/client';

interface VerificationRow {
  id: string;
  userId: string;
  status: string;
  cinUrl: string | null;
  selfieUrl: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  autoDeleteAt: string | null;
  user: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface VerificationsResponse {
  items: VerificationRow[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
}

export function AdminVerificationsListLive() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const path = `/api/admin/verifications?status=${statusFilter}&pageSize=50`;
  const { data, loading, error, refresh } = useApi<VerificationsResponse>(
    path,
    [statusFilter],
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const approve = async (id: string) => {
    setPendingId(id);
    try {
      await apiCall(`/api/admin/verifications/${id}/approve`, {
        method: 'POST',
      });
      await refresh();
    } catch (err) {
      window.alert(
        err instanceof ApiClientError ? err.userMessage : 'Action impossible.',
      );
    } finally {
      setPendingId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt('Motif de rejet (5 caractères min) :');
    if (!reason || reason.trim().length < 5) return;
    setPendingId(id);
    try {
      await apiCall(`/api/admin/verifications/${id}/reject`, {
        method: 'POST',
        body: { reason: reason.trim() },
      });
      await refresh();
    } catch (err) {
      window.alert(
        err instanceof ApiClientError ? err.userMessage : 'Action impossible.',
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {['PENDING', 'APPROVED', 'REJECTED'].map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={
                active
                  ? 'inline-flex rounded-pill bg-brand-navy text-white px-3 py-1.5 text-sm font-semibold'
                  : 'inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1.5 text-sm font-medium hover:border-brand-blue'
              }
            >
              {s}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 inline-flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          {error.userMessage}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
          Aucune demande dans ce filtre.
        </div>
      )}

      {data &&
        data.items.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl bg-white border border-gray-200 p-5 shadow-glow-soft"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-bold text-brand-navy">
                  {v.user.firstName} {v.user.lastName}
                </p>
                <p className="text-xs text-gray-500 break-all">{v.user.email}</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Soumis le {new Date(v.submittedAt).toLocaleString('fr-FR')}
                </p>
                {v.rejectionReason && (
                  <p className="mt-2 text-xs text-red-600">
                    Rejeté : {v.rejectionReason}
                  </p>
                )}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-pill bg-gray-100 text-gray-700">
                {v.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">CIN</p>
                {v.cinUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={v.cinUrl}
                    alt=""
                    className="w-full rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="aspect-video rounded-lg bg-gray-100 grid place-items-center text-xs text-gray-400">
                    Image purgée
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Selfie</p>
                {v.selfieUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={v.selfieUrl}
                    alt=""
                    className="w-full rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="aspect-video rounded-lg bg-gray-100 grid place-items-center text-xs text-gray-400">
                    Image purgée
                  </div>
                )}
              </div>
            </div>

            {v.status === 'PENDING' && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={pendingId === v.id}
                  onClick={() => approve(v.id)}
                  className="inline-flex items-center gap-1 rounded-pill bg-green-600 text-white px-4 py-1.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                >
                  {pendingId === v.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Approuver
                </button>
                <button
                  type="button"
                  disabled={pendingId === v.id}
                  onClick={() => reject(v.id)}
                  className="inline-flex items-center gap-1 rounded-pill bg-red-600 text-white px-4 py-1.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Rejeter
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
