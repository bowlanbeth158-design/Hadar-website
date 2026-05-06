'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Admin — liste utilisateurs avec actions block / unblock / delete.
// GET /api/admin/users + POST /api/admin/users/[id]/{block,unblock,delete}
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useApi } from '@/lib/api/hooks';
import { apiCall, ApiClientError } from '@/lib/api/client';

interface UserRow {
  id: string;
  status: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerifiedAt: string | null;
  identityVerified: boolean;
  publishedReportsCount: number;
  lastActivityAt: string | null;
  deletedAt: string | null;
  sanctionReason: string | null;
  createdAt: string;
}

interface UsersResponse {
  items: UserRow[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
}

const STATUS_TINT: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  BLOCKED: 'bg-red-100 text-red-700',
  DELETED: 'bg-gray-200 text-gray-500',
};

export function AdminUsersListLive() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const path = statusFilter
    ? `/api/admin/users?status=${statusFilter}&pageSize=50`
    : `/api/admin/users?pageSize=50`;
  const { data, loading, error, refresh } = useApi<UsersResponse>(path, [
    statusFilter,
  ]);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const block = async (user: UserRow) => {
    const reason = window.prompt('Motif de blocage (5 caractères min) :');
    if (!reason || reason.trim().length < 5) return;
    setPendingId(user.id);
    setActionError(null);
    try {
      await apiCall(`/api/admin/users/${user.id}/block`, {
        method: 'POST',
        body: { reason: reason.trim() },
      });
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError ? err.userMessage : 'Action impossible.',
      );
    } finally {
      setPendingId(null);
    }
  };

  const unblock = async (user: UserRow) => {
    setPendingId(user.id);
    setActionError(null);
    try {
      await apiCall(`/api/admin/users/${user.id}/unblock`, { method: 'POST' });
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError ? err.userMessage : 'Action impossible.',
      );
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (user: UserRow) => {
    if (!user.email) return;
    const reason = window.prompt('Motif de suppression :');
    if (!reason || reason.trim().length < 5) return;
    const confirmEmail = window.prompt(
      `Pour confirmer, retape l'email du compte : ${user.email}`,
    );
    if (confirmEmail !== user.email) {
      window.alert("L'email de confirmation ne correspond pas.");
      return;
    }
    setPendingId(user.id);
    setActionError(null);
    try {
      await apiCall(`/api/admin/users/${user.id}/delete`, {
        method: 'POST',
        body: { reason: reason.trim(), confirmEmail },
      });
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof ApiClientError ? err.userMessage : 'Action impossible.',
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {[null, 'ACTIVE', 'BLOCKED', 'INACTIVE', 'DELETED'].map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={String(s)}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={
                active
                  ? 'inline-flex rounded-pill bg-brand-navy text-white px-3 py-1.5 text-sm font-semibold'
                  : 'inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1.5 text-sm font-medium hover:border-brand-blue'
              }
            >
              {s ?? 'Tous'}
            </button>
          );
        })}
      </div>

      {actionError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 inline-flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          {actionError}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error.userMessage}
        </div>
      )}

      {data && (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Vérifié</th>
                <th className="px-4 py-3 text-left">Signalements</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-brand-navy break-all">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_TINT[u.status] ?? ''}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.emailVerifiedAt ? '✓ email' : '— email'}
                    <br />
                    {u.identityVerified ? '✓ identité' : '— identité'}
                  </td>
                  <td className="px-4 py-3 text-center text-brand-navy font-semibold">
                    {u.publishedReportsCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      {u.status === 'ACTIVE' && (
                        <button
                          type="button"
                          disabled={pendingId === u.id}
                          onClick={() => block(u)}
                          className="inline-flex items-center gap-1 rounded-pill bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          Bloquer
                        </button>
                      )}
                      {u.status === 'BLOCKED' && (
                        <button
                          type="button"
                          disabled={pendingId === u.id}
                          onClick={() => unblock(u)}
                          className="inline-flex items-center gap-1 rounded-pill bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Débloquer
                        </button>
                      )}
                      {u.status !== 'DELETED' && (
                        <button
                          type="button"
                          disabled={pendingId === u.id}
                          onClick={() => remove(u)}
                          className="inline-flex items-center gap-1 rounded-pill bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1 text-xs font-semibold disabled:opacity-60"
                        >
                          <Trash2 className="h-3 w-3" />
                          Supprimer
                        </button>
                      )}
                      {pendingId === u.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
            {data.pagination.total} utilisateur{data.pagination.total > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
