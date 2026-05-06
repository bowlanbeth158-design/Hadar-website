// ─────────────────────────────────────────────────────────────────────────────
// Cookies HttpOnly pour les access + refresh tokens.
//
// Politique :
//   - HttpOnly         : impossible à lire en JS (anti XSS exfil)
//   - Secure           : envoyé uniquement en HTTPS (en prod)
//   - SameSite=Lax     : envoyé sur top-level navigation, bloque CSRF
//                        cross-site sur les requêtes "non navigateur"
//   - Path=/           : envoyé sur tout le site
//   - Pas de Domain    : par défaut = host courant uniquement (pas de
//                        leak vers les sous-domaines)
//
// Durées :
//   - Access token  = 15 min (court → JWT directement, pas en DB)
//   - Refresh token = 30 jours (long → SHA-256 stocké en DB pour
//                                rotation et révocation instantanée)
// ─────────────────────────────────────────────────────────────────────────────

import type { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { REFRESH_TOKEN_TTL_DAYS } from './jwt';

const ACCESS_COOKIE = 'hadar_at';
const REFRESH_COOKIE = 'hadar_rt';
const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_SEC = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;

const isProd = () => process.env.NODE_ENV === 'production';

/// Pose les deux cookies d'authentification sur la réponse.
export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TTL_SEC,
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    // Limite le refresh aux endpoints qui en ont besoin → réduit
    // la surface XSS à l'/api/auth uniquement.
    path: '/api/auth',
    maxAge: REFRESH_TTL_SEC,
  });
}

/// Efface les deux cookies (logout). En prod : Secure activé, SameSite=Lax.
export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE, '', {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 0,
  });
}

export function readAccessToken(req: NextRequest): string | null {
  return req.cookies.get(ACCESS_COOKIE)?.value ?? null;
}

export function readRefreshToken(req: NextRequest): string | null {
  return req.cookies.get(REFRESH_COOKIE)?.value ?? null;
}

export const COOKIE_NAMES = {
  ACCESS: ACCESS_COOKIE,
  REFRESH: REFRESH_COOKIE,
} as const;
