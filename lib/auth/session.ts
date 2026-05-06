// ─────────────────────────────────────────────────────────────────────────────
// Gestion des sessions server-side.
//
// Une "session" = une ligne dans la table Session avec un refresh token
// hashé. Le client garde le refresh token clair en cookie HttpOnly. À
// chaque rotation (refresh ou login), on crée une nouvelle Session et
// on chaîne via rotatedFromId pour détecter la réutilisation.
//
// Détection de réutilisation : si on tente de rafraîchir avec un
// refresh token dont la session est déjà "consumée" (rotatedFromId
// pointe sur elle depuis une autre session), c'est qu'un attaquant a
// volé le cookie → on RÉVOQUE TOUTES les sessions de cet user.
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from '../db';
import { sha256 } from '../crypto/hash';
import {
  generateRefreshToken,
  signAccessToken,
  REFRESH_TOKEN_TTL_DAYS,
} from './jwt';
import type { AccountKind } from './types';

export interface SessionContext {
  /// User.id ou Member.id selon kind.
  accountId: string;
  kind: AccountKind;
  /// Pour les members.
  role?: string;
  ipHash: string;
  userAgentHash: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

/// Crée une nouvelle session (login ou rotation refresh) et retourne
/// les tokens à envoyer au client.
///
/// `rotatedFromId` : si on est dans un flow de refresh, l'id de la
/// session qu'on remplace. La nouvelle session pointe dessus pour que
/// la prochaine tentative avec l'ancienne soit détectable.
export async function createSession(
  ctx: SessionContext,
  rotatedFromId?: string,
): Promise<IssuedTokens> {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = sha256(refreshToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const session = await prisma.session.create({
    data: {
      ...(ctx.kind === 'user'
        ? { userId: ctx.accountId }
        : { memberId: ctx.accountId }),
      refreshTokenHash,
      rotatedFromId,
      ipHash: ctx.ipHash,
      userAgentHash: ctx.userAgentHash,
      expiresAt,
    },
  });

  const accessToken = await signAccessToken({
    sub: ctx.accountId,
    type: ctx.kind,
    role: ctx.role,
    sid: session.id,
  });

  return {
    accessToken,
    refreshToken,
    sessionId: session.id,
  };
}

/// Révoque une session (logout, ou révocation forcée). On ne supprime
/// pas la ligne — on met juste revokedAt + reason pour l'audit.
export async function revokeSession(
  sessionId: string,
  reason: string,
): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}

/// Révoque TOUTES les sessions actives d'un user/member. Utilisé en
/// cas de détection d'attaque (refresh token reuse) ou à la demande
/// (changement de mot de passe).
export async function revokeAllSessions(
  accountId: string,
  kind: AccountKind,
  reason: string,
): Promise<number> {
  const where =
    kind === 'user'
      ? { userId: accountId, revokedAt: null }
      : { memberId: accountId, revokedAt: null };
  const result = await prisma.session.updateMany({
    where,
    data: { revokedAt: new Date(), revokedReason: reason },
  });
  return result.count;
}

/// Recherche une session active par hash de refresh token. Retourne
/// null si introuvable, expirée, ou révoquée.
export async function findActiveSessionByRefresh(refreshToken: string) {
  const refreshTokenHash = sha256(refreshToken);
  const session = await prisma.session.findUnique({
    where: { refreshTokenHash },
  });
  if (!session) return null;
  if (session.revokedAt) return { session, status: 'revoked' as const };
  if (session.expiresAt < new Date()) return { session, status: 'expired' as const };
  return { session, status: 'active' as const };
}
