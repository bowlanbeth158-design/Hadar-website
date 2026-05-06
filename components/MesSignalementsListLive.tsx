'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Wrapper "live" qui appelle GET /api/reports/mine, mappe l'API shape
// vers le Report shape historique attendu par MesSignalementsList, et
// délègue le rendu. Si l'utilisateur n'est pas authentifié, on retombe
// sur les mocks (DemoBanner reste visible côté page).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import {
  USER_REPORTS,
  type Report,
  type ReportChannel,
  type ProblemKind,
} from '@/lib/mock/user-reports';
import { MesSignalementsList } from './MesSignalementsList';
import { useApi, legacyStatus } from '@/lib/api/hooks';
import { useAuth } from '@/lib/auth/AuthProvider';

interface ApiReportItem {
  id: string;
  channel: string;
  contactValue: string;
  problemType: string;
  amountCents: number | null;
  currency: string;
  descriptionPublic: string;
  status: string;
  moderationReason: string | null;
  createdAt: string;
  publishedAt: string | null;
}

interface ApiResponse {
  items: ApiReportItem[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
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

function formatAmount(cents: number | null, currency: string): string | undefined {
  if (cents === null || cents === undefined) return undefined;
  const value = cents; // déjà en plus petite unité — on l'affiche directement
  return `${value.toLocaleString('fr-FR')} ${currency}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function adapt(item: ApiReportItem): Report {
  return {
    id: item.id,
    channel: CHANNEL_TO_LEGACY[item.channel] ?? 'phone',
    contact: item.contactValue,
    problemKind:
      PROBLEM_TO_LEGACY[item.problemType] ?? 'non_livraison',
    descriptionText: item.descriptionPublic,
    dateText: formatDate(item.createdAt),
    submittedDateText: formatDate(item.createdAt),
    finalDateText: item.publishedAt ? formatDate(item.publishedAt) : undefined,
    amount: formatAmount(item.amountCents, item.currency),
    status: legacyStatus(item.status),
    proofs: [],
    moderationNoteText: item.moderationReason ?? undefined,
  };
}

export function MesSignalementsListLive() {
  const { me, loading: authLoading } = useAuth();
  const path = me?.kind === 'user' ? '/api/reports/mine?pageSize=50' : null;
  const { data, loading } = useApi<ApiResponse>(path);

  const reports = useMemo<Report[]>(() => {
    if (!data) return USER_REPORTS;
    return data.items.map(adapt);
  }, [data]);

  if (authLoading || loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
        Chargement…
      </div>
    );
  }

  return <MesSignalementsList reports={reports} />;
}
