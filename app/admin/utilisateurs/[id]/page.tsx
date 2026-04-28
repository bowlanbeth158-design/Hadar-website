'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Ban,
  KeyRound,
  Trash2,
  Undo2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { UserReasonModal, type ReasonAction } from '@/components/admin/UserReasonModal';
import { getUser, STATUS_STYLE, validationRate, type Status } from '@/lib/mock/utilisateurs';
import { REPORTS } from '@/lib/mock/signalements';
import { useI18n } from '@/lib/i18n/provider';
import { translateChannel, translateProblem, translateStatus, translateUserStatus } from '@/lib/i18n/helpers';

const STATUS_KEY = 'hadar:users:status';
const REASONS_KEY = 'hadar:users:reasons';

type StatusStore = Record<string, Status>;
type ReasonStore = Record<string, { action: ReasonAction; reason: string; when: string }>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function Page() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const base = id ? getUser(id) : undefined;

  const [statusOverrides, setStatusOverrides] = useState<StatusStore>({});
  const [reasons, setReasons] = useState<ReasonStore>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<{ open: boolean; action: ReasonAction | null }>({
    open: false,
    action: null,
  });

  useEffect(() => {
    setStatusOverrides(readJson<StatusStore>(STATUS_KEY, {}));
    setReasons(readJson<ReasonStore>(REASONS_KEY, {}));
  }, []);

  const showFlash = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash((m) => (m === msg ? null : m)), 2200);
  };

  const currentStatus: Status | undefined = base
    ? (statusOverrides[base.id] ?? base.status)
    : undefined;
  const reasonInfo = base ? reasons[base.id] : undefined;

  const userReports = useMemo(
    () => (base ? REPORTS.filter((r) => r.userId === base.id) : []),
    [base],
  );

  if (!base || !currentStatus) return notFound();

  const statusStyle = STATUS_STYLE[currentStatus];
  const rate = validationRate(base);

  const updateStatus = (next: Status) => {
    const updated = { ...statusOverrides, [base.id]: next };
    setStatusOverrides(updated);
    writeJson(STATUS_KEY, updated);
  };

  const updateReason = (action: ReasonAction, reason: string) => {
    const stamp = new Date().toLocaleString('fr-FR');
    const updated = { ...reasons, [base.id]: { action, reason, when: stamp } };
    setReasons(updated);
    writeJson(REASONS_KEY, updated);
  };

  const handleReset = () => showFlash(t('userDetail.flash.resetSent', { name: base.name }));

  const handleBlockOrUnblock = () => {
    if (currentStatus === 'bloque') {
      updateStatus('actif');
      showFlash(t('userDetail.flash.unblocked', { name: base.name }));
    } else if (currentStatus !== 'supprime') {
      setReasonModal({ open: true, action: 'block' });
    }
  };

  const handleDeleteOrRestore = () => {
    if (currentStatus === 'supprime') {
      updateStatus('actif');
      showFlash(t('userDetail.flash.restored', { name: base.name }));
    } else {
      setReasonModal({ open: true, action: 'delete' });
    }
  };

  const confirmReason = (reason: string) => {
    if (!reasonModal.action) return;
    const nextStatus: Status = reasonModal.action === 'block' ? 'bloque' : 'supprime';
    updateStatus(nextStatus);
    updateReason(reasonModal.action, reason);
    showFlash(
      reasonModal.action === 'block'
        ? t('userDetail.flash.blocked', { name: base.name })
        : t('userDetail.flash.deleted', { name: base.name }),
    );
    setReasonModal({ open: false, action: null });
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/utilisateurs"
            className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 bg-white text-brand-navy px-3.5 py-1.5 text-sm font-medium hover:border-brand-blue transition-all shadow-glow-soft hover:shadow-glow-navy"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('common.back')}
          </Link>
          <nav aria-label={t('detail.breadcrumbAria')} className="text-xs text-gray-400 hidden sm:block">
            <Link href="/admin/utilisateurs" className="hover:text-brand-navy">
              {t('users.title')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-brand-navy font-semibold">#{base.id}</span>
          </nav>
        </div>
      </div>

      {flash && (
        <div
          role="status"
          className="mb-6 rounded-xl bg-brand-sky/60 border border-brand-blue/30 text-brand-navy px-4 py-2 text-sm font-medium"
        >
          {flash}
        </div>
      )}

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-grad-stat-navy text-white flex items-center justify-center text-lg font-bold shadow-glow-navy">
              {base.name
                .split(' ')
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">{base.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="font-mono text-brand-navy">#{base.id}</span>
                <span className="text-gray-300">|</span>
                <span
                  className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${statusStyle.cls}`}
                >
                  {translateUserStatus(t, currentStatus)}
                </span>
                <span className="text-gray-300">|</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {base.city}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              disabled={currentStatus === 'supprime'}
              className="inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-orange-600 px-3 py-1.5 text-xs font-semibold hover:bg-orange-50 shadow-glow-soft disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <KeyRound className="h-3.5 w-3.5" aria-hidden />
              {t('users.bulk.resetPassword')}
            </button>
            <button
              type="button"
              onClick={handleBlockOrUnblock}
              disabled={currentStatus === 'supprime'}
              className={
                currentStatus === 'bloque'
                  ? 'inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-3 py-1.5 text-xs font-semibold shadow-glow-green transition-all'
                  : 'inline-flex items-center gap-1.5 rounded-pill border border-gray-200 text-brand-navy px-3 py-1.5 text-xs font-semibold hover:border-brand-blue shadow-glow-soft disabled:opacity-40 disabled:cursor-not-allowed transition-all'
              }
            >
              {currentStatus === 'bloque' ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {t('userActions.unblock')}
                </>
              ) : (
                <>
                  <Ban className="h-3.5 w-3.5" aria-hidden />
                  {t('userActions.block')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDeleteOrRestore}
              className={
                currentStatus === 'supprime'
                  ? 'inline-flex items-center gap-1.5 rounded-pill bg-green-500 hover:bg-green-700 text-white px-3 py-1.5 text-xs font-semibold shadow-glow-green transition-all'
                  : 'inline-flex items-center gap-1.5 rounded-pill bg-red-500 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-semibold shadow-glow-red transition-all'
              }
            >
              {currentStatus === 'supprime' ? (
                <>
                  <Undo2 className="h-3.5 w-3.5" aria-hidden />
                  {t('userActions.restore')}
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  {t('userActions.delete')}
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {reasonInfo && (currentStatus === 'bloque' || currentStatus === 'supprime') && (
        <section className="rounded-2xl bg-orange-50 border border-orange-200 p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" aria-hidden />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-700">
              {t('userDetail.reasonHeader', {
                type: t(reasonInfo.action === 'block' ? 'userDetail.reasonType.block' : 'userDetail.reasonType.delete'),
                when: reasonInfo.when,
              })}
            </p>
            <p className="mt-1 text-sm text-orange-900 whitespace-pre-wrap">{reasonInfo.reason}</p>
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-3 mb-5">
        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 lg:col-span-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            {t('userDetail.contactInfo')}
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500 inline-flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {t('users.col.email')}
              </dt>
              <dd className="text-brand-navy truncate">{base.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500 inline-flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {t('users.col.phone')}
              </dt>
              <dd className="text-brand-navy font-mono">{base.phone}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500 inline-flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                {t('users.col.signup')}
              </dt>
              <dd className="text-brand-navy">{base.signup}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-gray-500 inline-flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {t('users.col.lastSeen')}
              </dt>
              <dd className="text-brand-navy">{base.lastSeen}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft p-5 lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            {t('userDetail.activity')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-brand-sky/30 p-4">
              <p className="text-xs text-brand-navy/70">{t('userDetail.total')}</p>
              <p className="text-2xl font-bold text-brand-navy">
                <AnimatedCounter value={`${base.reportsTotal}`} />
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs text-green-700/80">{t('userDetail.published')}</p>
              <p className="text-2xl font-bold text-green-700">
                <AnimatedCounter value={`${base.reportsPublished}`} />
              </p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-red-700/80">{t('userDetail.rejected')}</p>
              <p className="text-2xl font-bold text-red-700">
                <AnimatedCounter value={`${base.reportsRejected}`} />
              </p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-xs text-yellow-700/80 inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                {t('userDetail.validationRate')}
              </p>
              <p className="text-2xl font-bold text-yellow-700">
                <AnimatedCounter value={`${rate}%`} />
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white border border-gray-200 shadow-glow-soft overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-brand-navy inline-flex items-center gap-2">
            <FileText className="h-4 w-4" aria-hidden />
            {t('userDetail.userReports')}
          </h2>
          <span className="text-xs text-gray-500">
            {t(userReports.length > 1 ? 'signalementCount.other' : 'signalementCount.one', {
              count: userReports.length,
            })}
          </span>
        </div>
        {userReports.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            {t('userDetail.noReports')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{t('users.col.id')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('userDetail.col.contact')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('userDetail.col.problem')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('userDetail.col.amount')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('userDetail.col.date')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('users.col.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userReports.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-sky/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      <Link
                        href={`/admin/signalements/${r.id}`}
                        className="hover:text-brand-blue"
                      >
                        #{r.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-brand-navy">{translateChannel(t, r.contact)}</td>
                    <td className="px-4 py-3 text-gray-600">{translateProblem(t, r.problem)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.amount}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{r.date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/signalements/${r.id}`}
                        className={
                          r.status === 'publie'
                            ? 'inline-flex items-center rounded-pill bg-green-100 text-green-700 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-green-200'
                            : r.status === 'non_retenu'
                              ? 'inline-flex items-center rounded-pill bg-red-100 text-red-700 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-red-200'
                              : r.status === 'a_corriger'
                                ? 'inline-flex items-center rounded-pill bg-brand-sky text-brand-navy px-2.5 py-0.5 text-[11px] font-semibold hover:bg-brand-sky/70'
                                : 'inline-flex items-center rounded-pill bg-orange-100 text-orange-700 px-2.5 py-0.5 text-[11px] font-semibold hover:bg-orange-200'
                        }
                      >
                        {translateStatus(t, r.status)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <UserReasonModal
        open={reasonModal.open}
        action={reasonModal.action}
        targetLabel={base.name}
        onClose={() => setReasonModal({ open: false, action: null })}
        onConfirm={confirmReason}
      />
    </div>
  );
}
