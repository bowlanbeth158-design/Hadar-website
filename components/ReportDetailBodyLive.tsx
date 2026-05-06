'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Wrapper live de ReportDetailBody — fetche GET /api/reports/[id],
// mappe vers le shape Report attendu, et délègue le rendu. Fallback
// sur USER_REPORTS mock si non authed (preserve les permaliens demo).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useApi } from '@/lib/api/hooks';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  USER_REPORTS,
  type Report,
  type ReportChannel,
  type ProblemKind,
} from '@/lib/mock/user-reports';
import { ReportDetailBody } from './ReportDetailBody';

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

const CHANNEL_TO_LEGACY: Record<string, ReportChannel> = {
  TELEPHONE: 'phone',
  WHATSAPP: 'phone',
  EMAIL: 'email',
  SITE_WEB: 'web',
  RESEAUX_SOCIAUX: 'web',
  PAYPAL: 'rib',
  BINANCE: 'rib',
  RIB: 'rib',
  CIN: 'phone',
};

const PROBLEM_TO_LEGACY: Record<string, ProblemKind> = {
  NON_LIVRAISON: 'non_livraison',
  BLOQUE_APRES_PAIEMENT: 'bloque_apres_paiement',
  PRODUIT_NON_CONFORME: 'produit_non_conforme',
  USURPATION_IDENTITE: 'usurpation_identite',
};

const STATUS_TO_LEGACY: Record<string, Report['status']> = {
  SUBMITTED: 'en_attente',
  UNDER_REVIEW: 'en_attente',
  PUBLISHED: 'publie',
  NEEDS_CORRECTION: 'a_corriger',
  REJECTED: 'refuse',
  ARCHIVED: 'publie',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function adapt(item: ApiReport): Report {
  return {
    id: item.id,
    channel: CHANNEL_TO_LEGACY[item.channel] ?? 'phone',
    contact: item.contactValue,
    problemKind: PROBLEM_TO_LEGACY[item.problemType] ?? 'non_livraison',
    descriptionText: item.descriptionPublic,
    dateText: formatDate(item.createdAt),
    submittedDateText: formatDate(item.createdAt),
    finalDateText: item.publishedAt ? formatDate(item.publishedAt) : undefined,
    amount:
      item.amountCents !== null
        ? `${item.amountCents.toLocaleString('fr-FR')} ${item.currency}`
        : undefined,
    status: STATUS_TO_LEGACY[item.status] ?? 'en_attente',
    proofs: [],
    moderationNoteText: item.moderationReason ?? undefined,
  };
}

export function ReportDetailBodyLive({ id }: { id: string }) {
  const { me, loading: authLoading } = useAuth();
  // Si non authed → fallback mock (preserve les démos /mes-signalements/1).
  const isMock = me === null || me?.kind !== 'user';
  const path = isMock ? null : `/api/reports/${id}`;
  const { data, loading, error } = useApi<ApiReport>(path);

  const report = useMemo<Report | null>(() => {
    if (data) return adapt(data);
    if (isMock) {
      return USER_REPORTS.find((r) => r.id === id) ?? null;
    }
    return null;
  }, [data, isMock, id]);

  if (authLoading || loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
        Chargement…
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-12 text-center text-sm text-red-700">
        {error ? error.userMessage : 'Signalement introuvable.'}
      </div>
    );
  }

  return <ReportDetailBody report={report} />;
}
