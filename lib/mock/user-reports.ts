import type { LucideIcon } from 'lucide-react';
import { Phone, Mail, Globe, CreditCard } from 'lucide-react';

export type ReportStatus = 'en_attente' | 'publie' | 'a_corriger' | 'refuse';
export type ReportChannel = 'phone' | 'email' | 'web' | 'rib';
export type ProblemKind =
  | 'non_livraison'
  | 'bloque_apres_paiement'
  | 'produit_non_conforme'
  | 'usurpation_identite';

export type Report = {
  id: string;
  channel: ReportChannel;
  contact: string;
  /** Type-safe problem kind — resolved through PROBLEM_KIND_LABEL_KEY at render. */
  problemKind: ProblemKind;
  /** i18n keys for the long free-text fields of the report. */
  descriptionKey: string;
  dateKey: string;
  submittedDateKey: string;
  reviewedDateKey?: string;
  finalDateKey?: string;
  amount?: string;
  status: ReportStatus;
  proofs: string[];
  /** Optional moderation reason — i18n key — set when status is 'a_corriger' or 'refuse'. */
  moderationNoteKey?: string;
};

export const REPORT_CHANNEL_ICON: Record<ReportChannel, LucideIcon> = {
  phone: Phone,
  email: Mail,
  web: Globe,
  rib: CreditCard,
};

// i18n key maps — the components resolve these via t() at render time.
// Keeps the mock structure data-only (no literal display strings).
export const REPORT_CHANNEL_LABEL_KEY: Record<ReportChannel, string> = {
  phone: 'mesSignalements.channel.phone',
  email: 'mesSignalements.channel.email',
  web:   'mesSignalements.channel.web',
  rib:   'mesSignalements.channel.rib',
};

export const STATUS_LABEL_KEY: Record<ReportStatus, string> = {
  en_attente: 'mesSignalements.status.pending',
  publie:     'mesSignalements.status.published',
  a_corriger: 'mesSignalements.status.toFix',
  refuse:     'mesSignalements.status.rejected',
};

export const PROBLEM_KIND_LABEL_KEY: Record<ProblemKind, string> = {
  non_livraison:         'form.problem.nonDelivery',
  bloque_apres_paiement: 'form.problem.blockedAfterPayment',
  produit_non_conforme:  'form.problem.nonCompliant',
  usurpation_identite:   'form.problem.identityTheft',
};

export const STATUS_BORDER: Record<ReportStatus, string> = {
  en_attente: 'border-l-yellow-500',
  publie: 'border-l-green-500',
  a_corriger: 'border-l-orange-500',
  refuse: 'border-l-red-500',
};

export const STATUS_BADGE: Record<ReportStatus, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  publie: 'bg-green-100 text-green-700',
  a_corriger: 'bg-orange-100 text-orange-700',
  refuse: 'bg-red-100 text-red-700',
};

export const STATUS_DOT: Record<ReportStatus, string> = {
  en_attente: 'bg-yellow-500',
  publie: 'bg-green-500',
  a_corriger: 'bg-orange-500',
  refuse: 'bg-red-500',
};

// Shared mock data — used by /mes-signalements (list) and /mes-signalements/[id]
// (detail) so the displayed status is always consistent across views.
export const USER_REPORTS: Report[] = [
  {
    id: '1',
    channel: 'phone',
    contact: '+212 6 12 34 •• ••',
    problemKind: 'non_livraison',
    descriptionKey: 'mock.report.r1.description',
    dateKey: 'mock.report.r1.date',
    submittedDateKey: 'mock.report.r1.submitted',
    reviewedDateKey: 'mock.report.r1.reviewed',
    finalDateKey: 'mock.report.r1.final',
    amount: '2 500 MAD',
    status: 'publie',
    proofs: ['screenshot-whatsapp-01.png', 'recu-paiement.pdf', 'conversation-email.png'],
  },
  {
    id: '2',
    channel: 'email',
    contact: 'contact@arnaqu••.com',
    problemKind: 'bloque_apres_paiement',
    descriptionKey: 'mock.report.r2.description',
    dateKey: 'mock.report.r2.date',
    submittedDateKey: 'mock.report.r2.submitted',
    amount: '850 MAD',
    status: 'en_attente',
    proofs: ['recu-paypal.pdf', 'screenshot-blocage.png'],
  },
  {
    id: '3',
    channel: 'web',
    contact: 'https://boutique-sus••.ma',
    problemKind: 'produit_non_conforme',
    descriptionKey: 'mock.report.r3.description',
    dateKey: 'mock.report.r3.date',
    submittedDateKey: 'mock.report.r3.submitted',
    reviewedDateKey: 'mock.report.r3.reviewed',
    amount: '1 200 MAD',
    status: 'a_corriger',
    moderationNoteKey: 'mock.report.r3.moderationNote',
    proofs: ['photo-recue-vs-annonce.png'],
  },
  {
    id: '4',
    channel: 'email',
    contact: 'paypal-us••@gmail.com',
    problemKind: 'usurpation_identite',
    descriptionKey: 'mock.report.r4.description',
    dateKey: 'mock.report.r4.date',
    submittedDateKey: 'mock.report.r4.submitted',
    reviewedDateKey: 'mock.report.r4.reviewed',
    finalDateKey: 'mock.report.r4.final',
    status: 'refuse',
    moderationNoteKey: 'mock.report.r4.moderationNote',
    proofs: ['email-frauduleux.png'],
  },
];

export type TimelineStep = {
  /** i18n key for the step label. */
  labelKey: string;
  /** i18n key for the step's date — or the literal placeholder
   * 'timeline.pending' when no concrete date exists yet. */
  dateKey: string;
  color: string;
  done: boolean;
};

/**
 * Build the moderation timeline that should be displayed for a given report.
 * Step shape (3 dots) varies with the final status so the UI always matches
 * what the list shows. Returns i18n keys instead of resolved strings so the
 * timeline localises with the active locale at render time.
 */
export function timelineFor(report: Report): TimelineStep[] {
  const sent: TimelineStep = {
    labelKey: 'timeline.sent',
    dateKey: report.submittedDateKey,
    color: 'bg-yellow-500',
    done: true,
  };

  const reviewing: TimelineStep = {
    labelKey: 'timeline.reviewing',
    dateKey: report.reviewedDateKey ?? 'timeline.pending',
    color: report.reviewedDateKey ? 'bg-orange-500' : 'bg-gray-200',
    done: !!report.reviewedDateKey,
  };

  if (report.status === 'en_attente') {
    return [
      sent,
      reviewing,
      { labelKey: 'timeline.decision', dateKey: 'timeline.pending', color: 'bg-gray-200', done: false },
    ];
  }
  if (report.status === 'publie') {
    return [
      sent,
      { ...reviewing, done: true, color: 'bg-orange-500' },
      {
        labelKey: 'timeline.published',
        dateKey: report.finalDateKey ?? 'timeline.pending',
        color: 'bg-green-500',
        done: true,
      },
    ];
  }
  if (report.status === 'a_corriger') {
    return [
      sent,
      { ...reviewing, done: true, color: 'bg-orange-500' },
      {
        labelKey: 'timeline.toFix',
        dateKey: report.reviewedDateKey ?? 'timeline.pending',
        color: 'bg-orange-500',
        done: true,
      },
    ];
  }
  // refuse
  return [
    sent,
    { ...reviewing, done: true, color: 'bg-orange-500' },
    {
      labelKey: 'timeline.rejected',
      dateKey: report.finalDateKey ?? 'timeline.pending',
      color: 'bg-red-500',
      done: true,
    },
  ];
}
