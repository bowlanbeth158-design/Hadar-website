// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
//
// Rafraîchit l'access token à partir du refresh token (cookie HttpOnly).
// Logique critique : DÉTECTION DE RÉUTILISATION.
//
// Cas normal : le client a un refresh token valide → on le révoque, on
// crée une nouvelle session liée à l'ancienne via rotatedFromId, on
// renvoie de nouveaux tokens.
//
// Cas attaque : un attaquant a volé un refresh token qui a déjà été
// utilisé. Il l'envoie ici → on détecte que la session associée est
// déjà révoquée (rotatedFromId pointe sur elle) → on révoque TOUTES
// les sessions de l'user (le vrai user devra se reconnecter).
// ─────────────────────────────────────────────────────────────────────────────

import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { readRefreshToken, clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies';
import {
  revokeSession,
  revokeAllSessions,
  createSession,
} from '@/lib/auth/session';
import { sha256 } from '@/lib/crypto/hash';
import { jsonOk, jsonError, jsonFromError } from '@/lib/api/response';
import { hmacIp, hmacUserAgent } from '@/lib/crypto/hmac';
import { getClientIp, getUserAgent } from '@/lib/api/request';
import { appendAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = readRefreshToken(req);
    if (!refreshToken) {
      return jsonError('UNAUTHORIZED', 'Refresh token manquant.');
    }
    const ipHash = hmacIp(getClientIp(req));
    const userAgentHash = hmacUserAgent(getUserAgent(req));

    const refreshTokenHash = sha256(refreshToken);
    const session = await prisma.session.findUnique({
      where: { refreshTokenHash },
    });

    if (!session) {
      // Token totalement inconnu — soit c'est une fausse tentative,
      // soit il a été purgé. On nettoie les cookies par sécurité.
      const res = jsonError('UNAUTHORIZED', 'Refresh token invalide.');
      clearAuthCookies(res);
      return res;
    }

    // ── Détection de réutilisation ──
    // Si la session est révoquée ET qu'une autre session a été créée
    // À PARTIR de celle-ci (rotatedFromId === session.id), c'est qu'on
    // a déjà rotationné ce token. Le présenter une 2e fois = vol.
    if (session.revokedAt) {
      // Cherche une session enfant qui pointe sur celle-ci.
      const child = await prisma.session.findUnique({
        where: { rotatedFromId: session.id },
        select: { id: true },
      });
      if (child) {
        // RÉUTILISATION DÉTECTÉE → révoque toutes les sessions.
        const accountKind = session.userId ? 'user' : 'member';
        const accountId = session.userId ?? session.memberId;
        if (accountId) {
          await revokeAllSessions(
            accountId,
            accountKind,
            'refresh_token_reuse_detected',
          );
          await appendAudit({
            actorType: 'SYSTEM',
            action: 'auth.refresh.reuse_detected',
            targetType: accountKind,
            targetId: accountId,
            ipHash,
            userAgentHash,
            payload: {
              originalSessionId: session.id,
              childSessionId: child.id,
            },
          });
        }
      }
      const res = jsonError('UNAUTHORIZED', 'Session révoquée.');
      clearAuthCookies(res);
      return res;
    }

    if (session.expiresAt < new Date()) {
      const res = jsonError('UNAUTHORIZED', 'Session expirée.');
      clearAuthCookies(res);
      return res;
    }

    // ── Rotation OK ──
    // 1. Marquer l'ancienne session comme révoquée.
    await revokeSession(session.id, 'rotated');

    // 2. Récupérer le rôle si c'est un member (pour le claim JWT).
    let role: string | undefined;
    if (session.memberId) {
      const m = await prisma.member.findUnique({
        where: { id: session.memberId },
        select: { role: true, status: true, deletedAt: true },
      });
      if (!m || m.deletedAt || m.status !== 'ACTIVE') {
        const res = jsonError('UNAUTHORIZED', 'Compte staff inactif.');
        clearAuthCookies(res);
        return res;
      }
      role = m.role;
    } else if (session.userId) {
      const u = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { status: true, deletedAt: true },
      });
      if (!u || u.deletedAt || u.status === 'BLOCKED') {
        const res = jsonError('UNAUTHORIZED', 'Compte utilisateur inactif.');
        clearAuthCookies(res);
        return res;
      }
    }

    // 3. Créer la nouvelle session, chaînée à l'ancienne.
    const tokens = await createSession(
      {
        accountId: session.userId ?? session.memberId!,
        kind: session.userId ? 'user' : 'member',
        role,
        ipHash,
        userAgentHash,
      },
      session.id,
    );

    const res = jsonOk({ ok: true });
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res;
  } catch (err) {
    return jsonFromError(err);
  }
}
