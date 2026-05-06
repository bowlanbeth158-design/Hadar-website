// ─────────────────────────────────────────────────────────────────────────────
// Réponses HTTP standardisées pour les routes API.
//
// Toutes les routes /api/* doivent renvoyer leurs réponses via jsonOk /
// jsonError plutôt que de faire `Response.json()` direct. Ça garantit :
//   - format de payload uniforme côté client : { ok: true, data } ou
//     { ok: false, error: { code, message, details? } }
//   - codes d'erreur métier consistants (cf. ErrorCode plus bas)
//   - Pas de leak d'erreur interne en prod (les détails ne fuient
//     que si NODE_ENV !== 'production')
//   - Headers de sécurité par défaut
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

/// Codes d'erreur métier — référencés par le front pour adapter les
/// messages traduits / les actions UI (ex : "EMAIL_TAKEN" → message
/// localisé "Cet email est déjà utilisé").
export type ErrorCode =
  | 'INVALID_INPUT'        // 400 — Zod fail
  | 'UNAUTHORIZED'         // 401 — pas de token / token invalide
  | 'FORBIDDEN'            // 403 — token OK mais permissions insuffisantes
  | 'NOT_FOUND'            // 404
  | 'CONFLICT'             // 409 — email déjà pris, doublon, etc.
  | 'UNPROCESSABLE'        // 422 — input syntaxiquement OK mais sémantiquement non
  | 'RATE_LIMITED'         // 429
  | 'ACCOUNT_LOCKED'       // 423 — trop d'échecs login → verrou temporaire
  | 'MFA_REQUIRED'         // 401 — login OK mais TOTP manquant
  | 'EMAIL_NOT_VERIFIED'   // 403 — l'user doit vérifier son email avant
  | 'INTERNAL_ERROR';      // 500 — fallback

const STATUS: Record<ErrorCode, number> = {
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  ACCOUNT_LOCKED: 423,
  MFA_REQUIRED: 401,
  EMAIL_NOT_VERIFIED: 403,
  INTERNAL_ERROR: 500,
};

interface ErrorPayload {
  ok: false;
  error: {
    code: ErrorCode;
    message: string;
    /// Détails Zod (path/message par champ). Présent uniquement pour
    /// INVALID_INPUT, jamais ailleurs.
    details?: Array<{ path: string; message: string }>;
  };
}

interface SuccessPayload<T> {
  ok: true;
  data: T;
}

/// Erreur API typée — throw cette instance depuis n'importe quelle
/// route, le wrapper l'attrape et la convertit en réponse HTTP propre.
export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly userMessage: string,
    public readonly headers?: Record<string, string>,
  ) {
    super(userMessage);
    this.name = 'ApiError';
  }
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
} as const;

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  const payload: SuccessPayload<T> = { ok: true, data };
  return NextResponse.json(payload, {
    status: init?.status ?? 200,
    headers: {
      ...SECURITY_HEADERS,
      ...(init?.headers as Record<string, string>),
    },
  });
}

export function jsonError(
  code: ErrorCode,
  message: string,
  options?: {
    details?: ErrorPayload['error']['details'];
    headers?: Record<string, string>;
  },
): NextResponse {
  const payload: ErrorPayload = { ok: false, error: { code, message } };
  if (options?.details) payload.error.details = options.details;
  return NextResponse.json(payload, {
    status: STATUS[code],
    headers: {
      ...SECURITY_HEADERS,
      ...options?.headers,
    },
  });
}

/// Convertit un ZodError en réponse INVALID_INPUT (400) avec le détail
/// par champ — le front peut souligner les champs concernés.
export function jsonZodError(error: ZodError): NextResponse {
  return jsonError('INVALID_INPUT', 'Données invalides.', {
    details: error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    })),
  });
}

/// Wrapper qui transforme les ApiError throw → NextResponse, et
/// log les erreurs inattendues sans révéler de détails au client.
export function jsonFromError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return jsonError(error.code, error.userMessage, {
      headers: error.headers,
    });
  }
  // Erreur inconnue — on log côté serveur et on renvoie un 500 générique.
  // En prod : pas de stack trace au client.
  // eslint-disable-next-line no-console
  console.error('[api] Unhandled error:', error);
  return jsonError(
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production'
      ? 'Erreur interne. Réessayez plus tard.'
      : `Erreur interne : ${(error as Error)?.message ?? 'unknown'}`,
  );
}
