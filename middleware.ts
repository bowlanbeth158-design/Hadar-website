// ─────────────────────────────────────────────────────────────────────────────
// Middleware Next.js — exécuté avant chaque requête /api/*.
//
// Responsabilités :
//   1. Vérification CSRF via Origin/Referer sur les mutations
//   2. Headers de sécurité supplémentaires sur /api/* (en plus de
//      ceux posés par next.config.mjs sur /:path*)
//
// Le middleware tourne en Edge runtime → pas de DB, pas de Prisma ici.
// Pour de l'auth lourde (lookup session DB), on continue dans la route.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse, type NextRequest } from 'next/server';
import { isCsrfSafe } from './lib/api/csrf';

export function middleware(req: NextRequest) {
  // Vérification CSRF sur les routes API (mutations uniquement).
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (!isCsrfSafe(req)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Origine non autorisée (CSRF).',
          },
        },
        {
          status: 403,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store',
          },
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
