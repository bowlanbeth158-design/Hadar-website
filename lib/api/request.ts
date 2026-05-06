// ─────────────────────────────────────────────────────────────────────────────
// Helpers pour extraire des infos d'une NextRequest.
//
// IMPORTANT — sécurité : on est derrière Cloudflare en prod. Cloudflare
// remplace l'IP source par celle du proxy → pour avoir la vraie IP du
// client, il faut lire les en-têtes que Cloudflare positionne :
//   - CF-Connecting-IP   (le plus fiable, présent toujours)
//   - X-Forwarded-For    (fallback générique, peut être truqué si pas
//                         derrière un proxy de confiance)
// ─────────────────────────────────────────────────────────────────────────────

import type { NextRequest } from 'next/server';

/// Extrait l'IP du client. Préférence : Cloudflare > XFF > IP socket.
/// Retourne 'unknown' si rien n'est trouvable (uniquement en dev local).
export function getClientIp(req: NextRequest): string {
  // Cloudflare positionne CF-Connecting-IP avec l'IP du client réel.
  // En prod c'est NOTRE source de vérité.
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();

  // Fallback : X-Forwarded-For (premier hop = client).
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0];
    if (first) return first.trim();
  }

  // Next.js sur Vercel expose l'IP via req.ip directement, mais pas en
  // self-host. On prend la valeur si dispo.
  const fromReq = (req as unknown as { ip?: string }).ip;
  if (fromReq) return fromReq;

  return 'unknown';
}

/// Extrait le User-Agent, tronqué à 1024 chars en sécurité (un attaquant
/// peut envoyer des UAs gigantesques pour saturer la DB).
export function getUserAgent(req: NextRequest): string {
  const ua = req.headers.get('user-agent') ?? '';
  return ua.slice(0, 1024);
}
