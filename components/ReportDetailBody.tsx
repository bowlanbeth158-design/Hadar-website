'use client';

import { Pencil, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import { PublishedCelebration } from './PublishedCelebration';
import {
  REPORT_CHANNEL_LABEL_KEY,
  STATUS_BADGE,
  STATUS_LABEL_KEY,
  PROBLEM_KIND_LABEL_KEY,
  timelineFor,
  type Report,
  type ReportStatus,
} from '@/lib/mock/user-reports';
import { useI18n } from '@/lib/i18n/provider';

const STATUS_COLOR_TEXT: Record<string, string> = {
  publie: 'text-green-600',
  en_attente: 'text-yellow-600',
  a_corriger: 'text-orange-600',
  refuse: 'text-red-600',
};

// Brand-coloured pulse animation applied to the LAST step of the timeline,
// matching the report's final decision per the brand charter.
const STATUS_PULSE: Record<ReportStatus, string> = {
  en_attente: 'animate-pulse-yellow',
  publie: 'animate-verify-pulse',
  a_corriger: 'animate-pulse-orange',
  refuse: 'animate-alert-pulse',
};

// Soft tinted gradient applied to the timeline card per decision.
const STATUS_TIMELINE_TINT: Record<ReportStatus, string> = {
  en_attente: 'bg-gradient-to-br from-yellow-100/60 via-white to-yellow-100/20',
  publie: 'bg-gradient-to-br from-green-100/60 via-white to-green-100/20',
  a_corriger: 'bg-gradient-to-br from-orange-100/60 via-white to-orange-100/20',
  refuse: 'bg-gradient-to-br from-red-100/60 via-white to-red-100/20',
};

// Body of /mes-signalements/[id] — client component so every label can
// come from useI18n() while the parent page stays a Server Component
// for its metadata + the URL-param report lookup.
export function ReportDetailBody({ report }: { report: Report }) {
  const { t, dir } = useI18n();
  const steps = timelineFor(report);
  const lastStepIdx = steps.length - 1;
  const finalPulse = STATUS_PULSE[report.status];

  return (
    <div dir={dir}>
      {report.status === 'publie' && <PublishedCelebration />}

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span
          className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[report.status]}`}
        >
          {t(STATUS_LABEL_KEY[report.status])}
        </span>
        <span className="text-xs font-medium text-brand-navy rounded-pill bg-brand-sky/60 px-2.5 py-0.5">
          {t(PROBLEM_KIND_LABEL_KEY[report.problemKind])}
        </span>
        <span className="text-xs text-gray-400">
          {t('reportDetail.id', { id: report.id })}
        </span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy break-all">
        {report.contact}
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        {t('reportDetail.subtitle', {
          channel: t(REPORT_CHANNEL_LABEL_KEY[report.channel]),
          date: t(report.submittedDateKey),
        })}
      </p>

      <div
        className={`mt-8 rounded-2xl border border-gray-200 p-6 shadow-glow-soft ${STATUS_TIMELINE_TINT[report.status]}`}
      >
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          {t('reportDetail.timeline')}
        </h2>
        <ol className="relative flex items-center justify-between">
          {steps.map((s, i) => (
            <li
              key={s.labelKey}
              className="flex-1 flex flex-col items-center text-center relative"
            >
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute left-0 right-1/2 top-3 h-[2px] ${
                    s.done ? 'bg-brand-blue' : 'bg-gray-200'
                  }`}
                />
              )}
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute right-0 left-1/2 top-3 h-[2px] ${
                    steps[i + 1]?.done ? 'bg-brand-blue' : 'bg-gray-200'
                  }`}
                />
              )}
              <span
                className={`relative z-10 h-6 w-6 rounded-full ${s.color} shadow ${i === lastStepIdx ? finalPulse : ''}`}
              />
              <p className="mt-2 text-xs font-semibold text-brand-navy">{t(s.labelKey)}</p>
              <p className="text-[10px] text-gray-400">{t(s.dateKey)}</p>
            </li>
          ))}
        </ol>
      </div>

      {report.moderationNoteKey && (
        <div
          className={`mt-6 rounded-2xl border-l-4 ${
            report.status === 'a_corriger'
              ? 'border-l-orange-500 bg-orange-50'
              : 'border-l-red-500 bg-red-50'
          } p-4 flex items-start gap-3`}
        >
          <AlertCircle
            className={`h-5 w-5 shrink-0 ${
              report.status === 'a_corriger' ? 'text-orange-500' : 'text-red-500'
            }`}
            aria-hidden
          />
          <div>
            <p
              className={`text-sm font-semibold ${
                report.status === 'a_corriger' ? 'text-orange-700' : 'text-red-700'
              }`}
            >
              {t('reportDetail.moderatorMessage')}
            </p>
            <p className="mt-1 text-sm text-gray-700">{t(report.moderationNoteKey)}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-3">
              {t('reportDetail.description')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{t(report.descriptionKey)}</p>
          </section>

          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-3">
              {t('reportDetail.proofs')}
            </h2>
            <ul className="space-y-2">
              {report.proofs.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-brand-navy"
                >
                  <Paperclip className="h-4 w-4 text-gray-400" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {t('reportDetail.info')}
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('reportDetail.info.type')}</dt>
                <dd className="font-medium text-brand-navy">
                  {t(REPORT_CHANNEL_LABEL_KEY[report.channel])}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('reportDetail.info.problem')}</dt>
                <dd className="font-medium text-brand-navy">
                  {t(PROBLEM_KIND_LABEL_KEY[report.problemKind])}
                </dd>
              </div>
              {report.amount && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('reportDetail.info.amount')}</dt>
                  <dd className="font-medium text-brand-navy">{report.amount}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">{t('reportDetail.info.status')}</dt>
                <dd
                  className={`font-medium ${STATUS_COLOR_TEXT[report.status] ?? 'text-brand-navy'}`}
                >
                  {t(STATUS_LABEL_KEY[report.status])}
                </dd>
              </div>
            </dl>
          </div>

          {report.status !== 'refuse' && (
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-pill bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-navy shadow-glow-blue hover:shadow-glow-navy transition-all"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              {t('reportDetail.btn.edit')}
            </button>
          )}
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-pill border border-red-500 text-red-500 px-5 py-2.5 text-sm font-semibold hover:bg-red-500 hover:text-white shadow-glow-soft hover:shadow-glow-red transition-all"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {t('reportDetail.btn.delete')}
          </button>
        </aside>
      </div>
    </div>
  );
}
