'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useApi } from '@/lib/api/hooks';

interface AuditRow {
  id: string;
  actorType: string;
  actorId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  payload: unknown;
  hash: string;
  prevHash: string;
  createdAt: string;
}

interface Response {
  items: AuditRow[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
}

export function AdminAuditLogLive() {
  const [actorType, setActorType] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const path = (() => {
    const p = new URLSearchParams({ pageSize: '100' });
    if (actorType) p.set('actorType', actorType);
    if (actionFilter) p.set('action', actionFilter);
    return `/api/admin/audit-log?${p.toString()}`;
  })();
  const { data, loading, error } = useApi<Response>(path, [
    actorType,
    actionFilter,
  ]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 inline-flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Journal d&apos;audit append-only</p>
          <p>
            Chaque ligne contient le hash de la précédente (chaîne anti
            tampering). Lecture réservée SUPER_ADMIN.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(['', 'USER', 'MEMBER', 'SYSTEM', 'ANONYMOUS'] as const).map((t) => {
          const v = t === '' ? null : t;
          const active = actorType === v;
          return (
            <button
              key={t || 'all'}
              type="button"
              onClick={() => setActorType(v)}
              className={
                active
                  ? 'inline-flex rounded-pill bg-brand-navy text-white px-3 py-1 text-xs font-semibold'
                  : 'inline-flex rounded-pill bg-white border border-gray-200 text-brand-navy px-3 py-1 text-xs'
              }
            >
              {t || 'Tous'}
            </button>
          );
        })}
        <input
          type="text"
          placeholder="Filtrer action (ex: report.publish)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-pill border border-gray-200 px-3 py-1 text-xs flex-1 min-w-[200px]"
        />
      </div>

      {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="inline h-4 w-4 mr-1" />
          {error.userMessage}
        </div>
      )}

      {data && (
        <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Acteur</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Cible</th>
                <th className="px-3 py-2 text-left">Hash</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] uppercase font-semibold text-brand-blue">
                      {r.actorType}
                    </span>{' '}
                    <span className="font-mono text-gray-500">
                      {r.actorId?.slice(0, 8) ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold text-brand-navy">
                    {r.action}
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {r.targetType}{' '}
                    <span className="font-mono text-gray-500">
                      {r.targetId?.slice(0, 8)}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px] text-gray-400">
                    {r.hash.slice(0, 12)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
            {data.pagination.total} lignes
          </div>
        </div>
      )}
    </div>
  );
}
