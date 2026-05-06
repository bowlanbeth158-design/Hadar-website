'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, Inbox, AlertCircle } from 'lucide-react';
import { useApi } from '@/lib/api/hooks';

interface TicketRow {
  id: string;
  subject: string;
  priority: string;
  status: string;
  slaDeadline: string;
  createdAt: string;
  assignedTo: {
    id: string;
    pii: { firstName: string; lastName: string } | null;
  } | null;
  user: {
    id: string;
    pii: { email: string; firstName: string; lastName: string } | null;
  } | null;
  guestEmail: string | null;
  _count: { messages: number };
}

interface Response {
  items: TicketRow[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
}

const PRIORITY_TINT: Record<string, string> = {
  URGENTE: 'bg-red-100 text-red-700',
  HAUTE: 'bg-orange-100 text-orange-700',
  MOYENNE: 'bg-yellow-100 text-yellow-700',
  BASSE: 'bg-gray-100 text-gray-700',
};

const STATUS_TINT: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-orange-100 text-orange-700',
  WAITING_USER: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
};

export function AdminTicketsListLive() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [assignedToMe, setAssignedToMe] = useState(false);
  const path = (() => {
    const p = new URLSearchParams({ pageSize: '50' });
    if (statusFilter) p.set('status', statusFilter);
    if (assignedToMe) p.set('assignedToMe', 'true');
    return `/api/admin/tickets?${p.toString()}`;
  })();
  const { data, loading, error } = useApi<Response>(path, [
    statusFilter,
    assignedToMe,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {[null, 'OPEN', 'ASSIGNED', 'WAITING_USER', 'RESOLVED', 'CLOSED'].map(
          (s) => {
            const active = statusFilter === s;
            return (
              <button
                key={String(s)}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={
                  active
                    ? 'inline-flex rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold'
                    : 'inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1 text-xs'
                }
              >
                {s ?? 'Tous'}
              </button>
            );
          },
        )}
        <label className="ml-auto inline-flex items-center gap-1 text-xs text-brand-navy">
          <input
            type="checkbox"
            checked={assignedToMe}
            onChange={(e) => setAssignedToMe(e.target.checked)}
          />
          Assignés à moi
        </label>
      </div>

      {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="inline h-4 w-4 mr-1" />
          {error.userMessage}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
          <Inbox className="mx-auto h-8 w-8 mb-2 text-gray-300" />
          Aucun ticket dans ce filtre.
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Sujet</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Priorité</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">SLA</th>
                <th className="px-4 py-3 text-left">Assigné</th>
                <th className="px-4 py-3 text-left">Msgs</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => {
                const overdue =
                  t.status !== 'RESOLVED' &&
                  t.status !== 'CLOSED' &&
                  new Date(t.slaDeadline) < new Date();
                return (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-brand-navy">
                      {t.subject}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {t.user?.pii?.email ?? t.guestEmail ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-pill px-2 py-0.5 text-xs font-semibold ${PRIORITY_TINT[t.priority]}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-pill px-2 py-0.5 text-xs font-semibold ${STATUS_TINT[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {overdue ? (
                        <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                          <AlertCircle className="h-3 w-3" />
                          En retard
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {new Date(t.slaDeadline).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {t.assignedTo?.pii
                        ? `${t.assignedTo.pii.firstName} ${t.assignedTo.pii.lastName.charAt(0)}.`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {t._count.messages}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
            {data.pagination.total} ticket{data.pagination.total > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
