'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Wrapper live pour MesAlertesList — appelle GET /api/alerts/mine et
// mappe la réponse au shape attendu (Alert[] du mock). Fallback sur les
// alertes mock si l'utilisateur n'est pas authed (preserve le DemoBanner
// côté page).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useApi } from '@/lib/api/hooks';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  DEMO_ALERTS,
  type Alert,
  type Channel,
  type RiskLevel,
} from '@/lib/mock/alerts';
import { MesAlertesList } from './MesAlertesList';

interface ApiAlertItem {
  id: string;
  channel: string;
  contactValueMasked: string;
  knownRiskLevel: string;
  currentRiskLevel: string;
  hasUpdate: boolean;
  totalReports: number;
  lastReportAt: string | null;
  createdAt: string;
}

interface ApiResponse {
  items: ApiAlertItem[];
}

const CHANNEL_TO_LEGACY: Record<string, Channel> = {
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

const RISK_TO_LEGACY: Record<string, RiskLevel> = {
  FAIBLE: 'low',
  VIGILANCE: 'vigilance',
  MODERE: 'moderate',
  ELEVE: 'high',
};

function adapt(item: ApiAlertItem): Alert {
  return {
    id: item.id,
    channel: CHANNEL_TO_LEGACY[item.channel] ?? 'phone',
    contact: item.contactValueMasked,
    summaryKey: 'mock.alert.a1.summary', // i18n placeholder, override par API plus tard
    messageKey: 'mock.alert.a1.message',
    dateKey: item.lastReportAt ? 'mock.alert.a1.date' : 'mock.alert.a1.lastReport',
    lastReportRelativeKey: 'mock.alert.a1.lastReport',
    count: item.totalReports,
    risk: RISK_TO_LEGACY[item.currentRiskLevel] ?? 'low',
    status: 'active',
    byCategory: {
      nonLivraison: 0,
      bloqueApresPaiement: 0,
      produitNonConforme: 0,
      usurpation: 0,
    },
  };
}

export function MesAlertesListLive({
  initialExpandId,
}: {
  initialExpandId?: string | null;
}) {
  const { me, loading: authLoading } = useAuth();
  const path = me?.kind === 'user' ? '/api/alerts/mine' : null;
  const { data, loading } = useApi<ApiResponse>(path);

  const alerts = useMemo<Alert[]>(() => {
    if (!data) return DEMO_ALERTS;
    if (data.items.length === 0) return [];
    return data.items.map(adapt);
  }, [data]);

  if (authLoading || loading) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center text-sm text-gray-400">
        Chargement…
      </div>
    );
  }

  if (alerts.length === 0) {
    // MesAlertesList a son propre empty-state, mais on contourne ici
    // car il peut chercher initialExpandId.
    return (
      <div className="rounded-2xl bg-white border border-gray-200 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-brand-navy mb-1">
          Aucun contact suivi.
        </p>
        <p className="text-xs text-gray-500 max-w-[300px] mx-auto">
          Quand tu rechercheras un contact, tu pourras cliquer sur le bouton
          « Suivre » pour être notifié des évolutions.
        </p>
      </div>
    );
  }

  return <MesAlertesList initialExpandId={initialExpandId} initialAlerts={alerts} />;
}
