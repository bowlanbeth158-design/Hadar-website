// ─────────────────────────────────────────────────────────────────────────────
// Hooks de données pour le front. Toutes les pages 'use client' qui
// affichent de la data passent par ces hooks plutôt que d'appeler
// apiCall() directement → ça centralise la gestion de loading /
// error / refresh.
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiCall, ApiClientError } from './client';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: ApiClientError | null;
  refresh: () => Promise<void>;
}

export function useApi<T>(path: string | null, deps: unknown[] = []): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchOnce = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall<T>(path);
      setData(result);
    } catch (err) {
      if (err instanceof ApiClientError) setError(err);
      else
        setError(
          new ApiClientError(
            'INTERNAL_ERROR',
            (err as Error)?.message ?? 'Erreur inconnue.',
            500,
          ),
        );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  return { data, loading, error, refresh: fetchOnce };
}

// ── Mappings entre l'API (statuts SUBMITTED, etc.) et le UI legacy
// ── (statuts en_attente, etc.). Évite de muter les composants UI.

export type LegacyReportStatus =
  | 'en_attente'
  | 'publie'
  | 'a_corriger'
  | 'refuse';

const STATUS_API_TO_LEGACY: Record<string, LegacyReportStatus> = {
  SUBMITTED: 'en_attente',
  UNDER_REVIEW: 'en_attente',
  PUBLISHED: 'publie',
  NEEDS_CORRECTION: 'a_corriger',
  REJECTED: 'refuse',
  ARCHIVED: 'publie',
};

export function legacyStatus(apiStatus: string): LegacyReportStatus {
  return STATUS_API_TO_LEGACY[apiStatus] ?? 'en_attente';
}

const CHANNEL_API_TO_LEGACY: Record<string, string> = {
  TELEPHONE: 'telephone',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SITE_WEB: 'site_web',
  RESEAUX_SOCIAUX: 'reseaux_sociaux',
  PAYPAL: 'paypal',
  BINANCE: 'binance',
  RIB: 'rib',
  CIN: 'cin',
};

export function legacyChannel(apiChannel: string): string {
  return CHANNEL_API_TO_LEGACY[apiChannel] ?? apiChannel.toLowerCase();
}

const PROBLEM_API_TO_LEGACY: Record<string, string> = {
  NON_LIVRAISON: 'nonDelivery',
  BLOQUE_APRES_PAIEMENT: 'blockedAfterPayment',
  PRODUIT_NON_CONFORME: 'nonCompliant',
  USURPATION_IDENTITE: 'identityTheft',
};

export function legacyProblem(apiProblem: string): string {
  return PROBLEM_API_TO_LEGACY[apiProblem] ?? apiProblem.toLowerCase();
}
