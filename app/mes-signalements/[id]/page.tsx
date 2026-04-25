import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Pencil, Trash2, Paperclip, AlertCircle } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BackButton } from '@/components/BackButton';
import { DemoBanner } from '@/components/DemoBanner';
import { PublishedCelebration } from '@/components/PublishedCelebration';
import {
  REPORT_CHANNEL_LABEL,
  STATUS_BADGE,
  STATUS_LABEL,
  USER_REPORTS,
  timelineFor,
  type ReportStatus,
} from '@/lib/mock/user-reports';

export const metadata: Metadata = {
  title: 'Détail du signalement',
  description: 'Consultez le détail complet de votre signalement et son évolution.',
};

type PageProps = { params: { id: string } };

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

export default function Page({ params }: PageProps) {
  const report = USER_REPORTS.find((r) => r.id === params.id);
  if (!report) notFound();

  const steps = timelineFor(report);
  const lastStepIdx = steps.length - 1;
  const finalPulse = STATUS_PULSE[report.status];

  return (
    <PageLayout>
      <div className="mb-8">
        <BackButton href="/mes-signalements" label="Mes signalements" />
      </div>
      <DemoBanner />

      {report.status === 'publie' && <PublishedCelebration />}

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span
          className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[report.status]}`}
        >
          {STATUS_LABEL[report.status]}
        </span>
        <span className="text-xs font-medium text-brand-navy rounded-pill bg-brand-sky/60 px-2.5 py-0.5">
          {report.problem}
        </span>
        <span className="text-xs text-gray-400">Signalement #{report.id}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy break-all">
        {report.contact}
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        {REPORT_CHANNEL_LABEL[report.channel]} — soumis le {report.submittedDate}
      </p>

      <div className="mt-8 rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Timeline
        </h2>
        <ol className="relative flex items-center justify-between">
          {steps.map((s, i) => (
            <li
              key={s.label}
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
              <p className="mt-2 text-xs font-semibold text-brand-navy">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.date}</p>
            </li>
          ))}
        </ol>
      </div>

      {report.moderationNote && (
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
              Message du modérateur
            </p>
            <p className="mt-1 text-sm text-gray-700">{report.moderationNote}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-3">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{report.description}</p>
          </section>

          <section className="rounded-2xl bg-white border border-gray-200 p-6 shadow-glow-soft">
            <h2 className="text-lg font-bold text-brand-navy mb-3">Preuves fournies</h2>
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
              Informations
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium text-brand-navy">
                  {REPORT_CHANNEL_LABEL[report.channel]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Problème</dt>
                <dd className="font-medium text-brand-navy">{report.problem}</dd>
              </div>
              {report.amount && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Montant</dt>
                  <dd className="font-medium text-brand-navy">{report.amount}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Statut</dt>
                <dd
                  className={`font-medium ${STATUS_COLOR_TEXT[report.status] ?? 'text-brand-navy'}`}
                >
                  {STATUS_LABEL[report.status]}
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
              Modifier
            </button>
          )}
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-pill border border-red-500 text-red-500 px-5 py-2.5 text-sm font-semibold hover:bg-red-500 hover:text-white shadow-glow-soft hover:shadow-glow-red transition-all"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Supprimer
          </button>
        </aside>
      </div>
    </PageLayout>
  );
}
