// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
//
// Déconnexion : révoque la session courante (basée sur le refresh token
// du cookie) et efface les deux cookies.
//
// On ne demande PAS d'auth bearer ici — un refresh token valide suffit
// (et même un refresh token expiré est acceptable, on efface quand même
// les cookies pour que le client ne reste pas dans un état zombi).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import {
  clearAuthCookies,
  readRefreshToken,
} from '@/lib/auth/cookies';
import {
  findActiveSessionByRefresh,
  revokeSession,
} from '@/lib/auth/session';
import { jsonOk, jsonFromError } from '@/lib/api/response';
import { appendAudit } from '@/lib/audit';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = readRefreshToken(req);
    const ipHash = hmacIp(getClientIp(req));
    const userAgentHash = hmacUserAgent(getUserAgent(req));

    if (refreshToken) {
      const result = await findActiveSessionByRefresh(refreshToken);
      if (result?.status === 'active') {
        await revokeSession(result.session.id, 'user_logout');
        // Audit logout. Note : actorType USER ou MEMBER selon la
        // session — on ne sait pas avant lookup.
        const isMember = !!result.session.memberId;
        await appendAudit({
          actorType: isMember ? 'MEMBER' : 'USER',
          actorId: result.session.userId ?? result.session.memberId,
          action: 'auth.logout',
          ipHash,
          userAgentHash,
        });
      }
    }

    const res = jsonOk({ ok: true });
    clearAuthCookies(res);
    return res;
  } catch (err) {
    return jsonFromError(err);
  }
}
