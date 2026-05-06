// ─────────────────────────────────────────────────────────────────────────────
// Client API typé pour le front.
//
// Toutes les pages du front passent par apiCall() — jamais fetch()
// direct. Ça centralise :
//   - Le credentials: 'include' pour envoyer les cookies HttpOnly
//   - Le auto-refresh sur 401 (un retry après /api/auth/refresh)
//   - Le parsing du payload standard { ok, data, error }
//   - Les types des erreurs métier (cf. ErrorCode dans lib/api/response)
//
// Côté serveur (RSC, route handlers) : on N'utilise PAS ce client,
// on importe Prisma directement. Ce module est strictement pour le
// front (composants 'use client').
// ─────────────────────────────────────────────────────────────────────────────

import type { ErrorCode } from './response';

export interface ApiSuccessEnvelope<T> {
  ok: true;
  data: T;
}

export interface ApiErrorEnvelope {
  ok: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Array<{ path: string; message: string }>;
  };
}

export type ApiResponse<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

/// Erreur typée à throw côté front. Les composants la catchent et
/// matchent sur err.code pour adapter l'UI (ex : EMAIL_NOT_VERIFIED
/// → bandeau "vérifie ton email").
export class ApiClientError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly userMessage: string,
    public readonly status: number,
    public readonly details?: Array<{ path: string; message: string }>,
  ) {
    super(userMessage);
    this.name = 'ApiClientError';
  }
}

interface CallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /// Désactive le auto-refresh sur 401 (utile pour /api/auth/refresh
  /// lui-même → éviter la boucle infinie).
  skipRefreshOnAuth?: boolean;
}

let inflightRefresh: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (inflightRefresh) return inflightRefresh;
  inflightRefresh = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      inflightRefresh = null;
    }
  })();
  return inflightRefresh;
}

export async function apiCall<T>(
  path: string,
  opts: CallOptions = {},
): Promise<T> {
  const method = opts.method ?? 'GET';
  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  };

  let res = await fetch(path, init);

  // Auto-refresh : si 401 et qu'on n'est pas déjà en train de refresh
  // → on tente refresh puis retry une seule fois.
  if (res.status === 401 && !opts.skipRefreshOnAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await fetch(path, init);
    }
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      'INTERNAL_ERROR',
      'Réponse serveur invalide.',
      res.status,
    );
  }

  if (!payload.ok) {
    throw new ApiClientError(
      payload.error.code,
      payload.error.message,
      res.status,
      payload.error.details,
    );
  }
  return payload.data;
}
