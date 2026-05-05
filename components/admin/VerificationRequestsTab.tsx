'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Maximize2,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  INITIAL_VERIFICATIONS,
  type VerificationRequest,
  type VerificationStatus,
} from '@/lib/mock/verifications';
import { getUser, INITIAL_USERS } from '@/lib/mock/utilisateurs';
import { useI18n } from '@/lib/i18n/provider';

// Tab body for /admin/utilisateurs → "Vérifications". Lists every
// identity-verification request the platform has received, lets the
// admin compare the CIN photo and the selfie side-by-side, and
// approve or reject each one. Approving sets user.verified = true;
// rejecting requires a written reason which is appended to the
// audit log.
//
// State is kept in localStorage so the demo persists across reloads.
// Real implementation will hit a server endpoint.

const STATE_KEY = 'hadar:admin:verifications';
const USERS_VERIFIED_KEY = 'hadar:admin:users:verified';
const AUDIT_KEY = 'hadar:admin:audit';

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

const STATUS_STYLE: Record<VerificationStatus, { cls: string; Icon: typeof CheckCircle2; labelKey: string }> = {
  pending:  { cls: 'text-orange-700 bg-orange-100 ring-orange-500/30', Icon: Clock,        labelKey: 'admin.verif.status.pending'  },
  approved: { cls: 'text-green-700 bg-green-100 ring-green-500/30',    Icon: CheckCircle2, labelKey: 'admin.verif.status.approved' },
  rejected: { cls: 'text-red-700 bg-red-100 ring-red-500/30',          Icon: XCircle,      labelKey: 'admin.verif.status.rejected' },
};

type AuditEntry = {
  ts: string;
  scope: 'verification' | 'star';
  action: string;
  targetUserId: string;
  details?: string;
};

function appendAudit(entry: AuditEntry) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    const list: AuditEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    // Cap at 200 entries so localStorage doesn't grow unbounded
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

export function VerificationRequestsTab() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<VerificationRequest[]>(INITIAL_VERIFICATIONS);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [compareReq, setCompareReq] = useState<VerificationRequest | null>(null);
  const [rejectReq, setRejectReq] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Load persisted state once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) setRequests(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist on every change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STATE_KEY, JSON.stringify(requests));
    } catch {
      /* ignore */
    }
  }, [requests]);

  const filtered = useMemo(() => {
    if (filter === 'all') return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const counts = useMemo(
    () => ({
      pending:  requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      all:      requests.length,
    }),
    [requests],
  );

  const approve = (req: VerificationRequest) => {
    const now = new Date().toLocaleString('fr-FR');
    setRequests((rs) =>
      rs.map((r) =>
        r.id === req.id
          ? { ...r, status: 'approved' as const, decidedBy: 'Vous', decidedAt: now, rejectionReason: undefined }
          : r,
      ),
    );
    // Flip the user.verified flag through localStorage so the user's
    // public profile picks up the badge immediately.
    flipVerified(req.userId, true);
    appendAudit({
      ts: now,
      scope: 'verification',
      action: 'approve',
      targetUserId: req.userId,
    });
  };

  const reject = (req: VerificationRequest, reason: string) => {
    const now = new Date().toLocaleString('fr-FR');
    setRequests((rs) =>
      rs.map((r) =>
        r.id === req.id
          ? { ...r, status: 'rejected' as const, decidedBy: 'Vous', decidedAt: now, rejectionReason: reason }
          : r,
      ),
    );
    flipVerified(req.userId, false);
    appendAudit({
      ts: now,
      scope: 'verification',
      action: 'reject',
      targetUserId: req.userId,
      details: reason,
    });
  };

  const filterButton = (id: StatusFilter, count: number, labelKey: string, dotCls: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setFilter(id)}
      className={
        filter === id
          ? 'inline-flex items-center gap-1.5 rounded-pill bg-brand-navy text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all'
          : 'inline-flex items-center gap-1.5 rounded-pill bg-white border border-gray-200 text-brand-navy hover:border-brand-blue hover:text-brand-blue px-3 py-1.5 text-xs font-medium transition-all'
      }
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
      {t(labelKey)}
      <span className="tabular-nums opacity-80">({count})</span>
    </button>
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {filterButton('pending',  counts.pending,  'admin.verif.filter.pending',  'bg-orange-500')}
        {filterButton('approved', counts.approved, 'admin.verif.filter.approved', 'bg-green-500')}
        {filterButton('rejected', counts.rejected, 'admin.verif.filter.rejected', 'bg-red-500')}
        {filterButton('all',      counts.all,      'admin.verif.filter.all',      'bg-gray-400')}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">{t('admin.verif.col.user')}</th>
              <th className="px-4 py-3 text-left">{t('admin.verif.col.email')}</th>
              <th className="px-4 py-3 text-left">{t('admin.verif.col.submittedAt')}</th>
              <th className="px-4 py-3 text-center">{t('admin.verif.col.documents')}</th>
              <th className="px-4 py-3 text-left">{t('admin.verif.col.status')}</th>
              <th className="px-4 py-3 text-right">{t('admin.verif.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  {t('admin.verif.empty')}
                </td>
              </tr>
            )}
            {filtered.map((req) => {
              const user = getUser(req.userId);
              if (!user) return null;
              const style = STATUS_STYLE[req.status];
              return (
                <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-brand-navy">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 tabular-nums whitespace-nowrap">
                    {req.submittedAt}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setCompareReq(req)}
                      className="inline-flex items-center gap-1.5 rounded-pill bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue px-3 py-1 text-xs font-semibold transition-colors"
                    >
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                      {t('admin.verif.compare')}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-pill ring-1 px-2.5 py-0.5 text-xs font-semibold ${style.cls}`}
                    >
                      <style.Icon className="h-3.5 w-3.5" aria-hidden />
                      {t(style.labelKey)}
                    </span>
                    {req.status === 'rejected' && req.rejectionReason && (
                      <p className="mt-1 text-[11px] text-gray-500 italic max-w-xs truncate" title={req.rejectionReason}>
                        {req.rejectionReason}
                      </p>
                    )}
                    {req.decidedBy && (
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {req.decidedAt} · {req.decidedBy}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === 'pending' ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => approve(req)}
                          className="inline-flex items-center gap-1 rounded-pill bg-green-500 hover:bg-green-700 text-white px-2.5 py-1 text-xs font-semibold transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                          {t('admin.verif.action.approve')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectReq(req);
                            setRejectReason('');
                          }}
                          className="inline-flex items-center gap-1 rounded-pill bg-red-500 hover:bg-red-700 text-white px-2.5 py-1 text-xs font-semibold transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" aria-hidden />
                          {t('admin.verif.action.reject')}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Side-by-side comparison modal */}
      {compareReq && (() => {
        const user = getUser(compareReq.userId);
        return (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setCompareReq(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-brand-blue" aria-hidden />
                  <div>
                    <h3 className="text-sm font-bold text-brand-navy">
                      {t('admin.verif.compare.title')}
                    </h3>
                    {user && (
                      <p className="text-xs text-gray-500">
                        {user.name} · {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompareReq(null)}
                  aria-label={t('admin.verif.close')}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-400 hover:text-brand-navy hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 p-4">
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={compareReq.cinUrl}
                    alt={t('admin.verif.compare.cinAlt')}
                    className="w-full rounded-xl border border-gray-200 object-cover"
                  />
                  <figcaption className="mt-2 text-xs font-semibold text-brand-navy text-center">
                    {t('admin.verif.compare.cin')}
                  </figcaption>
                </figure>
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={compareReq.selfieUrl}
                    alt={t('admin.verif.compare.selfieAlt')}
                    className="w-full rounded-xl border border-gray-200 object-cover"
                  />
                  <figcaption className="mt-2 text-xs font-semibold text-brand-navy text-center">
                    {t('admin.verif.compare.selfie')}
                  </figcaption>
                </figure>
              </div>

              {compareReq.status === 'pending' && (
                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      approve(compareReq);
                      setCompareReq(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-4 py-1.5 text-sm font-semibold transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    {t('admin.verif.action.approve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectReq(compareReq);
                      setRejectReason('');
                      setCompareReq(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-4 py-1.5 text-sm font-semibold transition-colors"
                  >
                    <XCircle className="h-4 w-4" aria-hidden />
                    {t('admin.verif.action.reject')}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Reject reason modal */}
      {rejectReq && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setRejectReq(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-brand-navy mb-1">
              {t('admin.verif.reject.title')}
            </h3>
            <p className="text-xs text-gray-500 mb-3">{t('admin.verif.reject.subtitle')}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={300}
              placeholder={t('admin.verif.reject.placeholder')}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-brand-navy focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectReq(null)}
                className="inline-flex items-center gap-1 rounded-pill bg-white border border-gray-200 text-brand-navy hover:border-brand-blue hover:text-brand-blue px-4 py-1.5 text-sm font-medium transition-colors"
              >
                {t('admin.verif.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (rejectReason.trim() === '') return;
                  reject(rejectReq, rejectReason.trim());
                  setRejectReq(null);
                }}
                disabled={rejectReason.trim() === ''}
                className="inline-flex items-center gap-1.5 rounded-pill bg-red-500 enabled:hover:bg-red-700 text-white px-4 py-1.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="h-4 w-4" aria-hidden />
                {t('admin.verif.reject.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Persist user.verified flips so the public profile picks them up
// without needing a real backend.
function flipVerified(userId: string, verified: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(USERS_VERIFIED_KEY);
    const map: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    map[userId] = verified;
    window.localStorage.setItem(USERS_VERIFIED_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

// Read helper for components that want to render the badge — kept
// here so the storage key only lives in one place.
export function readVerifiedFlag(userId: string): boolean {
  if (typeof window === 'undefined') return false;
  const fallback = INITIAL_USERS.find((u) => u.id === userId)?.verified ?? false;
  try {
    const raw = window.localStorage.getItem(USERS_VERIFIED_KEY);
    if (!raw) return fallback;
    const map: Record<string, boolean> = JSON.parse(raw);
    return map[userId] ?? fallback;
  } catch {
    return fallback;
  }
}

// Re-exported so other tabs (e.g. Étoiles) can drop their own audit
// log entries through the same storage key.
export { appendAudit, type AuditEntry, AUDIT_KEY };
