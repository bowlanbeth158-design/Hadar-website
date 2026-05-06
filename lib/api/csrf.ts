// ─────────────────────────────────────────────────────────────────────────────
// Vérification CSRF par Origin / Referer header (défense en profondeur).
//
// On utilise déjà SameSite=Lax sur les cookies → ça bloque la majorité
// des CSRF. Mais SameSite=Lax laisse passer les top-level navigations
// GET, donc on ajoute une couche : sur toute mutation (POST/PUT/PATCH/
// DELETE) on vérifie que l'Origin du browser matche l'origine attendue.
//
// Cette logique est appliquée par middleware sur /api/* (sauf endpoints
// publics non-sensibles).
//
// Bypass volontaires :
//   - GET (idempotent par défaut, RFC 7231)
//   - /api/reports/[id]/contestation : formulaire public sans cookie
//   - /api/uploads (POST) : reste protégé via auth cookie
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';

/// Routes API exemptées de la vérification d'Origin (formulaires publics).
const CSRF_EXEMPT_PATTERNS: RegExp[] = [
  /^\/api\/reports\/[^/]+\/contestation$/,
];

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function isCsrfSafe(req: NextRequest): boolean {
  if (SAFE_METHODS.has(req.method)) return true;

  const path = new URL(req.url).pathname;
  if (CSRF_EXEMPT_PATTERNS.some((re) => re.test(path))) return true;

  // Construire l'origine attendue à partir du host de la requête.
  // Cloudflare / Next pose le header Host correctement → on peut s'y
  // fier en prod (en dev local : http://localhost:3000).
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');
  if (!host) return false;

  const expectedOrigins = [
    `https://${host}`,
    `http://${host}`, // dev only
    process.env.NEXT_PUBLIC_APP_URL ?? '',
  ].filter(Boolean);

  // Origin est plus fiable que Referer (toujours posé sur les
  // requêtes cross-origin par le browser, sauf navigations top-level).
  if (origin) {
    return expectedOrigins.includes(origin);
  }

  // Pas d'Origin → on tolère si le Referer matche (cas certains old
  // browsers / extensions). Sinon refuse.
  if (referer) {
    try {
      const refUrl = new URL(referer);
      const refOrigin = `${refUrl.protocol}//${refUrl.host}`;
      return expectedOrigins.includes(refOrigin);
    } catch {
      return false;
    }
  }

  // Ni Origin ni Referer sur une mutation → suspect, on refuse.
  return false;
}
